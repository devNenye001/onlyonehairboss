import { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../utils/supabase/client';
import { HiOutlineSave, HiOutlineLockClosed } from 'react-icons/hi';
import './AdminSettings.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminSettings = () => {
  const [smtp, setSmtp] = useState({
    host: '',
    port: '587',
    user: '',
    pass: '',
    fromEmail: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [smtpMsg, setSmtpMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const fetchSmtpSettings = async () => {
    try {
      const { data } = await supabase.from('site_content').select('*').eq('key', 'smtp_settings').maybeSingle();
      if (data?.value) {
        setSmtp(data.value);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmtpSettings();
  }, []);

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpMsg('');
    try {
      const { error } = await supabase.from('site_content').insert({
        key: 'smtp_settings',
        value: smtp
      });
      if (error) throw error;
      setSmtpMsg('SMTP Configuration saved successfully!');
    } catch (err) {
      console.error(err);
      setSmtpMsg('Failed to save SMTP settings: ' + err.message);
    } finally {
      setSavingSmtp(false);
      setTimeout(() => setSmtpMsg(''), 4000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassMsg('New passwords do not match.');
      return;
    }
    setSavingPass(true);
    setPassMsg('');

    try {
      const token = localStorage.getItem('hairboss_token');
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      
      setPassMsg('Admin password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setPassMsg('Error: ' + err.message);
    } finally {
      setSavingPass(false);
      setTimeout(() => setPassMsg(''), 4000);
    }
  };

  return (
    <AdminLayout>
      <div className="settings-page">
        <div className="settings-header">
          <p className="settings-tag">Admin</p>
          <h1 className="settings-headline">Settings</h1>
        </div>

        {loading ? <p className="settings-loading">Loading settings configurations...</p> : (
          <div className="settings-grid">
            
            {/* SMTP Settings Panel */}
            <form onSubmit={handleSaveSmtp} className="settings-card">
              <h2>SMTP Server Settings</h2>
              <p className="settings-desc">Configure the outbound mail server used to send client receipts, welcome letters, and forgot password codes.</p>
              
              {smtpMsg && <p className="settings-alert-msg">{smtpMsg}</p>}

              <div className="settings-field-group">
                <label>SMTP Host</label>
                <input 
                  type="text" 
                  value={smtp.host} 
                  onChange={e => setSmtp({ ...smtp, host: e.target.value })} 
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>

              <div className="settings-row-fields">
                <div className="settings-field-group">
                  <label>SMTP Port</label>
                  <input 
                    type="text" 
                    value={smtp.port} 
                    onChange={e => setSmtp({ ...smtp, port: e.target.value })} 
                    placeholder="587"
                    required
                  />
                </div>
                <div className="settings-field-group">
                  <label>From Name & Email Address</label>
                  <input 
                    type="text" 
                    value={smtp.fromEmail} 
                    onChange={e => setSmtp({ ...smtp, fromEmail: e.target.value })} 
                    placeholder='"OnlyOne Hairboss" <noreply@onlyonehairboss.com>'
                  />
                </div>
              </div>

              <div className="settings-field-group">
                <label>SMTP Username / Email</label>
                <input 
                  type="email" 
                  value={smtp.user} 
                  onChange={e => setSmtp({ ...smtp, user: e.target.value })} 
                  placeholder="email@gmail.com"
                  required
                />
              </div>

              <div className="settings-field-group">
                <label>SMTP Password / App Password</label>
                <input 
                  type="password" 
                  value={smtp.pass} 
                  onChange={e => setSmtp({ ...smtp, pass: e.target.value })} 
                  placeholder="••••••••••••••••"
                  required
                />
              </div>

              <button type="submit" className="settings-save-btn" disabled={savingSmtp}>
                <HiOutlineSave /> {savingSmtp ? 'Saving...' : 'Save SMTP Settings'}
              </button>
            </form>

            {/* Password Management Settings Panel */}
            <form onSubmit={handleChangePassword} className="settings-card">
              <h2>Change Admin Password</h2>
              <p className="settings-desc">Update the password used to log in to the OnlyOne Hairboss admin dashboard portal.</p>
              
              {passMsg && <p className="settings-alert-msg">{passMsg}</p>}

              <div className="settings-field-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={passwordForm.currentPassword} 
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                  required
                />
              </div>

              <div className="settings-field-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.newPassword} 
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                  required
                />
              </div>

              <div className="settings-field-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordForm.confirmPassword} 
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                  required
                />
              </div>

              <button type="submit" className="settings-save-btn btn-secondary" disabled={savingPass}>
                <HiOutlineLockClosed /> {savingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>

          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
