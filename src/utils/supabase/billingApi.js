// billingApi.js
// Frontend helpers for the two Edge Functions.
// Import these wherever you need billing or signup metadata calls.

import { supabase } from './client'

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

// ── Internal: get the current user's JWT for Authorization header ─────────────
const getBearerToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Not authenticated')
  return `Bearer ${session.access_token}`
}

// ── Internal: shared fetch wrapper ───────────────────────────────────────────
const callFunction = async (name, body) => {
  const token = await getBearerToken()
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  })

  const payload = await res.json()

  if (!res.ok) {
    // Surface the server error message to the caller
    throw new Error(payload?.error ?? `HTTP ${res.status}`)
  }

  return payload
}

// ─────────────────────────────────────────────────────────────────────────────
// saveBilling
//
// Upserts billing/shipping info for the authenticated user.
// Returns the saved billing row on success.
//
// Usage:
//   const { data } = await saveBilling({ full_name, email, phone, address, city, state })
//
// Request body shape:
//   {
//     full_name : string  (required, non-blank)
//     email     : string  (required, valid format)
//     phone     : string
//     address   : string
//     city      : string
//     state     : string
//     country   : string  (defaults to "Nigeria" on the server)
//   }
//
// Response body shape on success:
//   {
//     data: {
//       id, user_id, full_name, email, phone,
//       address, city, state, country, updated_at
//     }
//   }
// ─────────────────────────────────────────────────────────────────────────────
export const saveBilling = async ({
  full_name,
  email,
  phone = '',
  address = '',
  city = '',
  state = '',
  country = 'Nigeria',
}) => {
  return callFunction('save-billing', {
    full_name,
    email,
    phone,
    address,
    city,
    state,
    country,
    // NOTE: user_id is intentionally NOT sent — the server reads it from the JWT
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// syncSignupMetadata
//
// Writes full_name to Supabase Auth user_metadata and syncs profiles table.
// Call this once after a successful signUp() or after Google OAuth login.
//
// Usage:
//   await syncSignupMetadata({ full_name: 'Ada Okafor' })
//   // Or let the server derive it from Google metadata:
//   await syncSignupMetadata({})
//
// Request body shape:
//   { full_name?: string }   — omit to use existing metadata (e.g. Google OAuth)
//
// Response body shape on success:
//   { success: true, user_id: string, full_name: string }
// ─────────────────────────────────────────────────────────────────────────────
export const syncSignupMetadata = async ({ full_name = '' } = {}) => {
  return callFunction('handle-signup-metadata', { full_name })
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchBilling
//
// Reads the current user's billing row directly from Supabase (no Edge Function
// needed for reads — RLS handles access control).
//
// Returns null if no billing row exists yet.
// ─────────────────────────────────────────────────────────────────────────────
export const fetchBilling = async () => {
  const { data, error } = await supabase
    .from('billing_info')
    .select('*')
    .maybeSingle()   // returns null instead of error when no row exists

  if (error) throw new Error(error.message)
  return data
}
