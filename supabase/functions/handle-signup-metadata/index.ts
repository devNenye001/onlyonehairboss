// Edge Function: handle-signup-metadata
// POST /functions/v1/handle-signup-metadata
//
// Writes full_name into Supabase Auth user_metadata for the authenticated user
// AND keeps public.profiles in sync.
//
// Two call patterns:
//   A. Called by the frontend immediately after signUp() to ensure metadata is set.
//   B. Called whenever the user updates their display name.
//
// Note: For new email/password signups, passing `options.data.full_name` in
// supabase.auth.signUp() already writes to user_metadata automatically — this
// function provides an explicit server-side confirmation and profile sync.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient }      from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST')   return json({ error: 'Method not allowed' }, 405)

  try {
    // ── 1. Authenticate the caller ───────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    // User-scoped client — validates the JWT, no service-role exposure needed
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── 2. Parse body ────────────────────────────────────────────────────────
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    // Accept explicit full_name or fall back to what is already in metadata
    // (useful for Google OAuth where Google already populated it).
    const rawName =
      (typeof body.full_name === 'string' ? body.full_name.trim() : '') ||
      (user.user_metadata?.full_name ?? '') ||
      (user.user_metadata?.name ?? '')   // Google OAuth uses 'name'

    const full_name = typeof rawName === 'string' ? rawName.trim() : ''

    if (!full_name) return json({ error: 'full_name is required' }, 400)

    // ── 3. Write to Auth user_metadata ───────────────────────────────────────
    // supabase.auth.updateUser() uses the user's own JWT — the user can only
    // update their own metadata, no admin key required.
    const { error: metaError } = await supabase.auth.updateUser({
      data: { full_name },
    })

    if (metaError) {
      console.error('[handle-signup-metadata] updateUser error:', metaError.message)
      return json({ error: 'Failed to update user metadata' }, 400)
    }

    // ── 4. Sync public.profiles ──────────────────────────────────────────────
    // The DB trigger handles this on first signup, but an explicit upsert here
    // covers Google OAuth users and any re-name operations.
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        { id: user.id, email: user.email, full_name },
        { onConflict: 'id' }
      )

    if (profileError) {
      // Non-fatal: metadata was already updated above.
      // Log but still return success.
      console.error('[handle-signup-metadata] profile sync error:', profileError.message)
    }

    return json({
      success: true,
      user_id: user.id,
      full_name,
    })

  } catch (err) {
    console.error('[handle-signup-metadata] unhandled error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
