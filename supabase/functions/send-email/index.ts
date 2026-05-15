import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM = 'OnlyOne Hairboss <hello@onlyonehairboss.com>'
const SITE = 'https://onlyonehairboss.vercel.app'

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
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  if (!RESEND_API_KEY) return json({ error: 'RESEND_API_KEY not configured' }, 500)

  try {
    const { type, data } = await req.json()

    let subject = ''
    let html = ''
    const to: string = data.email

    if (type === 'welcome') {
      subject = 'Welcome to OnlyOne Hairboss'
      html = welcomeEmail(data.name || data.email)
    } else if (type === 'order_confirmation') {
      subject = `Order Confirmed – #${data.orderId}`
      html = orderEmail(data)
    } else {
      return json({ error: 'Unknown email type' }, 400)
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })

    const result = await res.json()
    return json(result, res.ok ? 200 : 400)
  } catch (err) {
    console.error('[send-email] error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

function welcomeEmail(name: string): string {
  const firstName = name.split(' ')[0]
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#FFF1EA;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border:1px solid rgba(153,85,68,0.15);">
    <div style="background:#995544;padding:28px 32px;text-align:center;">
      <p style="color:#FFF1EA;font-size:1.5rem;font-weight:400;margin:0;letter-spacing:-0.02em;">OnlyOne Hairboss</p>
    </div>
    <div style="padding:36px 32px;">
      <p style="font-size:0.8rem;font-weight:500;color:#995544;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px;">Welcome</p>
      <h2 style="font-size:1.9rem;font-weight:400;color:#000;margin:0 0 16px;">Hi, ${firstName}!</h2>
      <p style="font-size:0.97rem;color:#555;line-height:1.7;margin:0 0 16px;">
        Thank you for joining OnlyOne Hairboss — where luxury hair meets bold women. We're so glad you're here.
      </p>
      <p style="font-size:0.97rem;color:#555;line-height:1.7;margin:0 0 28px;">
        Explore our collection of premium wigs crafted for quality, elegance, and attention-grabbing styles.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${SITE}/shop"
           style="display:inline-block;padding:14px 40px;background:#995544;color:#FFF1EA;text-decoration:none;font-weight:500;font-size:0.95rem;">
          Shop the Collection
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid rgba(153,85,68,0.1);text-align:center;">
      <p style="font-size:0.78rem;color:#bbb;margin:0;">© OnlyOne Hairboss · Port Harcourt, Nigeria</p>
    </div>
  </div>
</body>
</html>`
}

interface OrderData {
  name: string
  orderId: string
  total: number
  items: Array<{ name: string; quantity: number; price: number }>
  address: string
  city: string
  state: string
}

function orderEmail(data: OrderData): string {
  const firstName = (data.name || '').split(' ')[0] || 'there'
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(153,85,68,0.08);font-size:0.92rem;color:#333;">${item.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(153,85,68,0.08);font-size:0.92rem;color:#777;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(153,85,68,0.08);font-size:0.92rem;color:#333;text-align:right;">&#8358;${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#FFF1EA;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border:1px solid rgba(153,85,68,0.15);">
    <div style="background:#995544;padding:28px 32px;text-align:center;">
      <p style="color:#FFF1EA;font-size:1.5rem;font-weight:400;margin:0;letter-spacing:-0.02em;">OnlyOne Hairboss</p>
    </div>
    <div style="padding:36px 32px;">
      <p style="font-size:0.8rem;font-weight:500;color:#995544;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 10px;">Order Confirmed</p>
      <h2 style="font-size:1.9rem;font-weight:400;color:#000;margin:0 0 8px;">Thank you, ${firstName}!</h2>
      <p style="font-size:0.97rem;color:#555;line-height:1.7;margin:0 0 24px;">
        Your order <strong style="color:#000;font-family:monospace;">#${data.orderId}</strong> has been received and payment confirmed.
        We'll process it within 3 working days.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(153,85,68,0.15);margin-bottom:20px;">
        <thead>
          <tr>
            <th style="padding:10px 0;font-size:0.78rem;color:#999;font-weight:500;text-align:left;text-transform:uppercase;letter-spacing:0.04em;">Item</th>
            <th style="padding:10px 0;font-size:0.78rem;color:#999;font-weight:500;text-align:center;text-transform:uppercase;letter-spacing:0.04em;">Qty</th>
            <th style="padding:10px 0;font-size:0.78rem;color:#999;font-weight:500;text-align:right;text-transform:uppercase;letter-spacing:0.04em;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:14px 0 0;font-size:1rem;font-weight:600;color:#000;">Total</td>
            <td style="padding:14px 0 0;font-size:1rem;font-weight:600;color:#995544;text-align:right;">&#8358;${data.total.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:rgba(153,85,68,0.05);border:1px solid rgba(153,85,68,0.12);padding:16px 20px;margin-bottom:28px;">
        <p style="font-size:0.78rem;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">Shipping To</p>
        <p style="font-size:0.93rem;color:#333;margin:0;line-height:1.6;">${data.address}, ${data.city}, ${data.state}</p>
      </div>

      <div style="text-align:center;">
        <a href="${SITE}/account"
           style="display:inline-block;padding:14px 40px;background:#995544;color:#FFF1EA;text-decoration:none;font-weight:500;font-size:0.95rem;">
          View My Orders
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid rgba(153,85,68,0.1);text-align:center;">
      <p style="font-size:0.78rem;color:#bbb;margin:0;">© OnlyOne Hairboss · Port Harcourt, Nigeria</p>
    </div>
  </div>
</body>
</html>`
}
