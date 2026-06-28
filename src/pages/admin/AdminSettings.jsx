import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { HiOutlineLockClosed } from 'react-icons/hi';
import './AdminSettings.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminSettings = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState('');

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

        <div className="settings-single-card-wrap">
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
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
