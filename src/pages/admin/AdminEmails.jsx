import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../utils/supabase/client';
import { HiOutlineMailOpen, HiOutlineMail } from 'react-icons/hi';
import './AdminEmails.css';

const AdminEmails = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testEmail) return;
    setSending(true);
    setMsg('');

    try {
      let data = {};
      if (selectedTemplate === 'welcome') {
        data = { email: testEmail, name: 'Valued Customer' };
      } else if (selectedTemplate === 'forgot_password') {
        data = { email: testEmail, resetUrl: `${window.location.origin}/reset-password?token=TEST_TOKEN` };
      } else if (selectedTemplate === 'order_confirmation') {
        data = {
          email: testEmail,
          name: 'Ada Okafor',
          orderId: 'OHB-7C9A',
          total: 540000,
          items: [
            { name: 'Layered Bone Straight Wig', quantity: 1, price: 270000 },
            { name: 'Short Wavy Bob Wig', quantity: 1, price: 270000 }
          ],
          address: '45 Awolowo Road, Ikoyi',
          city: 'Lagos',
          state: 'Lagos'
        };
      }

      const { error } = await supabase.functions.invoke('send-email', {
        body: { type: selectedTemplate, data }
      });

      if (error) throw error;
      setMsg(`Test email dispatched successfully to ${testEmail}! (Check your terminal console if SMTP is not configured)`);
    } catch (err) {
      console.error(err);
      setMsg('Failed to send test email: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  // Mock template preview render
  const getPreviewHtml = () => {
    const header = `
      <div style="background:#111; padding:25px; text-align:center; border-bottom:3px solid #d4af37;">
        <h1 style="color:#fff; font-family:'Playfair Display', serif; font-size:22px; margin:0; letter-spacing:2px; text-transform:uppercase;">OnlyOne Hairboss</h1>
        <p style="color:#d4af37; font-size:10px; margin:4px 0 0 0; letter-spacing:3px; text-transform:uppercase;">Luxury Hair & Wigs</p>
      </div>
    `;

    const footer = `
      <div style="background:#fcfbf9; padding:20px; text-align:center; font-size:11px; color:#888; border-top:1px solid #eee; font-family:sans-serif;">
        <p>&copy; ${new Date().getFullYear()} OnlyOne Hairboss. All rights reserved.</p>
        <p>You received this email because you registered on our platform.</p>
      </div>
    `;

    if (selectedTemplate === 'welcome') {
      return `
        ${header}
        <div style="padding:40px 30px; font-family:sans-serif; color:#333; line-height:1.6; font-size:14px;">
          <h2 style="margin-top:0; color:#111; font-size:20px;">Welcome to the Inner Circle, Valued Customer!</h2>
          <p>We are absolutely thrilled to welcome you to <strong>OnlyOne Hairboss</strong>, your premier destination for the finest quality luxury wigs and hair extensions.</p>
          <p>Your account is now active. You can browse our exclusive collection, track your orders, and manage your shipping details seamlessly.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display:inline-block; padding:12px 30px; background:#111; color:#fff; text-decoration:none; border-radius:6px; font-weight:600; border:1px solid #d4af37; font-size:13px; letter-spacing:1px;">Explore the Collection</a>
          </div>
          <p>If you have any questions or require personalized recommendations, feel free to reply to this email. Our support team is always here to assist you.</p>
        </div>
        ${footer}
      `;
    }

    if (selectedTemplate === 'forgot_password') {
      return `
        ${header}
        <div style="padding:40px 30px; font-family:sans-serif; color:#333; line-height:1.6; font-size:14px;">
          <h2 style="margin-top:0; color:#111; font-size:20px;">Reset Your Password</h2>
          <p>We received a request to reset the password associated with your account on <strong>OnlyOne Hairboss</strong>.</p>
          <p>Click the button below to choose a new password. This link is secure and will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="display:inline-block; padding:12px 30px; background:#111; color:#fff; text-decoration:none; border-radius:6px; font-weight:600; border:1px solid #d4af37; font-size:13px; letter-spacing:1px;">Reset Password</a>
          </div>
          <p style="font-size:12px; color:#777;">If you didn't request this change, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
        ${footer}
      `;
    }

    if (selectedTemplate === 'order_confirmation') {
      return `
        ${header}
        <div style="padding:40px 30px; font-family:sans-serif; color:#333; line-height:1.6; font-size:14px;">
          <h2 style="margin-top:0; color:#27ae60; font-size:20px;">Thank You for Your Order!</h2>
          <p>Hi Ada Okafor,</p>
          <p>Your payment has been received, and your order <strong>#OHB-7C9A</strong> has been confirmed. We are currently preparing your luxury wig packages for dispatch.</p>
          
          <h3 style="border-bottom:1px solid #eee; padding-bottom:8px; margin-top:30px; color:#111; font-size:15px; text-transform:uppercase; letter-spacing:0.5px;">Order Details</h3>
          <table style="width:100%; border-collapse:collapse; margin-top:15px;">
            <thead>
              <tr style="border-bottom:2px solid #eee; font-size:12px; text-transform:uppercase; color:#666;">
                <th style="text-align:left; padding:8px 0;">Item</th>
                <th style="text-align:right; padding:8px 0;">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:10px 0; border-bottom:1px solid #eee;">Layered Bone Straight Wig <span style="color:#777; font-size:12px;">x1</span></td>
                <td style="text-align:right; padding:10px 0; border-bottom:1px solid #eee; font-weight:bold;">₦270,000</td>
              </tr>
              <tr>
                <td style="padding:10px 0; border-bottom:1px solid #eee;">Short Wavy Bob Wig <span style="color:#777; font-size:12px;">x1</span></td>
                <td style="text-align:right; padding:10px 0; border-bottom:1px solid #eee; font-weight:bold;">₦270,000</td>
              </tr>
              <tr style="font-weight:bold; font-size:15px;">
                <td style="padding:15px 0;">Total Paid</td>
                <td style="text-align:right; padding:15px 0;">₦540,000</td>
              </tr>
            </tbody>
          </table>

          <h3 style="border-bottom:1px solid #eee; padding-bottom:8px; margin-top:30px; color:#111; font-size:15px; text-transform:uppercase; letter-spacing:0.5px;">Delivery Address</h3>
          <p style="margin-bottom:0; font-size:13px; color:#555; line-height:1.5;">
            45 Awolowo Road, Ikoyi<br>
            Lagos, Lagos<br>
            Nigeria
          </p>
        </div>
        ${footer}
      `;
    }
    return '';
  };

  return (
    <AdminLayout>
      <div className="emails-page">
        <div className="emails-header">
          <p className="emails-tag">Admin</p>
          <h1 className="emails-headline">Email Templates</h1>
        </div>

        {msg && <p className="emails-alert">{msg}</p>}

        <div className="emails-split-grid">
          {/* Templates Navigation Sidebar */}
          <div className="emails-sidebar-box">
            <h3>Branded Templates</h3>
            <div className="template-nav">
              <button 
                className={`template-nav-btn ${selectedTemplate === 'welcome' ? 'active' : ''}`}
                onClick={() => setSelectedTemplate('welcome')}
              >
                Welcome Email
              </button>
              <button 
                className={`template-nav-btn ${selectedTemplate === 'forgot_password' ? 'active' : ''}`}
                onClick={() => setSelectedTemplate('forgot_password')}
              >
                Forgot Password
              </button>
              <button 
                className={`template-nav-btn ${selectedTemplate === 'order_confirmation' ? 'active' : ''}`}
                onClick={() => setSelectedTemplate('order_confirmation')}
              >
                Order Confirmed
              </button>
            </div>

            {/* Test Send Panel */}
            <div className="test-send-panel">
              <h4>Send Test Email</h4>
              <p className="panel-desc">Test how the template renders in a real email client.</p>
              <form onSubmit={handleSendTest} className="test-form">
                <input 
                  type="email" 
                  value={testEmail} 
                  onChange={e => setTestEmail(e.target.value)} 
                  placeholder="recipient@email.com" 
                  required
                />
                <button type="submit" className="send-btn" disabled={sending}>
                  <HiOutlineMail /> {sending ? 'Sending...' : 'Send Test'}
                </button>
              </form>
            </div>
          </div>

          {/* Visual Device Preview */}
          <div className="preview-main">
            <div className="preview-toolbar">
              <span className="toolbar-dot"></span>
              <span className="toolbar-dot"></span>
              <span className="toolbar-dot"></span>
              <span className="preview-title">Live Preview: {selectedTemplate.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="preview-screen">
              <div 
                className="preview-iframe-mock"
                dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEmails;
