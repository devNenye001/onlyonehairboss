// Edge Function: save-billing
// POST /functions/v1/save-billing
//
// Upserts a billing_info row for the authenticated user.
// user_id is always sourced from the verified JWT — never trusted from the body.
// RLS provides the second enforcement layer.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── CORS ─────────────────────────────────────────────────────────────────────
// Restrict origin to your production domain in prod, e.g.:
//   'Access-Control-Allow-Origin': 'https://onlyonehairboss.com'
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

// ── Handler ───────────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  // Pre-flight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

  try {
    // ── 1. Authenticate ──────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing Authorization header' }, 401)

    // Use the caller's JWT with the anon key so Supabase validates the token
    // and RLS is enforced as that user.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── 2. Parse & validate body ─────────────────────────────────────────────
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid JSON body' }, 400)
    }

    const full_name = typeof body.full_name === 'string' ? body.full_name.trim() : ''
    const email     = typeof body.email     === 'string' ? body.email.trim()     : ''
    const phone     = typeof body.phone     === 'string' ? body.phone.trim()     : ''
    const address   = typeof body.address   === 'string' ? body.address.trim()   : ''
    const city      = typeof body.city      === 'string' ? body.city.trim()      : ''
    const state     = typeof body.state     === 'string' ? body.state.trim()     : ''
    const country   = typeof body.country   === 'string' ? body.country.trim()   : 'Nigeria'

    if (!full_name)             return json({ error: 'full_name is required'        }, 400)
    if (!email)                 return json({ error: 'email is required'            }, 400)
    if (!isValidEmail(email))   return json({ error: 'email format is invalid'      }, 400)

    // ── 3. Upsert ────────────────────────────────────────────────────────────
    // user_id is always set from the verified JWT — body.user_id is IGNORED.
    // onConflict:'user_id' targets the UNIQUE(user_id) constraint.
    // RLS INSERT + UPDATE policies provide the second enforcement layer:
    //   - INSERT WITH CHECK  → new row's user_id must equal auth.uid()
    //   - UPDATE USING       → existing row's user_id must equal auth.uid()
    //   - UPDATE WITH CHECK  → resulting row's user_id must still equal auth.uid()
    const { data, error: upsertError } = await supabase
      .from('billing_info')
      .upsert(
        {
          user_id: user.id,  // ← always from JWT, never from client
          full_name,
          email,
          phone,
          address,
          city,
          state,
          country,
        },
        { onConflict: 'user_id' }
      )
      .select('id, user_id, full_name, email, phone, address, city, state, country, updated_at')
      .single()

    if (upsertError) {
      // Expose constraint violation messages to help the frontend, but not
      // internal Postgres details.
      const msg = upsertError.message.includes('billing_')
        ? upsertError.message
        : 'Failed to save billing information'
      return json({ error: msg }, 400)
    }

    return json({ data }, 200)

  } catch (err) {
    console.error('[save-billing] unhandled error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
