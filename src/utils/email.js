import { supabase } from './supabase/client'

export const sendEmail = async (type, data) => {
  try {
    await supabase.functions.invoke('send-email', { body: { type, data } })
  } catch {
    // fire-and-forget — never block the user flow
  }
}
