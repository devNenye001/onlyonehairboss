import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase/client';
import './AdminLogin.css';

const AdminLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);

    if (mode === 'forgot') {
      const { error: err } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (err) setError(err.message);
      else setSuccess('Reset link sent! Check your email inbox.');
      return;
    }

    const { data: authData, error: err } = await signIn(form.email, form.password);
    if (err) { setError(err.message); setLoading(false); return; }

    const { data: profileData } = await supabase
      .from('profiles').select('role').eq('id', authData.user.id).single();

    setLoading(false);
    if (profileData?.role === 'admin') {
      navigate('/admin/products');
    } else {
      await supabase.auth.signOut();
      setError('Access denied. Admin account required.');
    }
  };

  return (
    <div className="admin-login-page">
      <Motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/">
          <img src="/logo1.svg" alt="OnlyOne Hairboss" className="admin-login-logo" />
        </Link>
        <p className="admin-login-tag">Admin Portal</p>
        <h1 className="admin-login-headline">{mode === 'forgot' ? 'Reset Password' : 'Sign In'}</h1>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="admin@email.com" />
          </div>

          {mode === 'login' && (
            <div className="admin-field">
              <div className="admin-label-row">
                <label>Password</label>
                <button type="button" className="admin-forgot-link" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>
                  Forgot password?
                </button>
              </div>
              <div className="password-wrap">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>
          )}

          {error   && <p className="admin-error">{error}</p>}
          {success && <p className="admin-success">{success}</p>}

          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? 'Please wait...' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
          </button>
        </form>

        {mode === 'forgot' ? (
          <button className="admin-back-link" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
            ← Back to Sign In
          </button>
        ) : (
          <Link to="/" className="admin-back-link">← Back to site</Link>
        )}
      </Motion.div>
    </div>
  );
};

export default AdminLogin;
