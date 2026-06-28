import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { supabase } from '../../utils/supabase/client';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Case 1: token already processed before component mounted — check hash + session
    const params = new URLSearchParams(window.location.hash.replace('#', '?').slice(1));
    if (params.get('type') === 'recovery') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
      return;
    }

    // Case 2: session already exists (token was processed just before mount)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) setReady(true);
    });

    // Case 3: event fires after mount
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (mounted && event === 'PASSWORD_RECOVERY') setReady(true);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) setError(err.message);
    else { setSuccess(true); setTimeout(() => navigate('/auth'), 2500); }
  };

  return (
    <div className="rp-page">
      <Link to="/" className="auth-logo-link">
        <img src="/logo1.svg" alt="OnlyOne Hairboss" className="rp-logo" />
      </Link>

      <Motion.div
        className="rp-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="rp-tag">Account</p>
        <h1 className="rp-headline">New Password</h1>

        {success ? (
          <div className="rp-success">
            <p>Password updated! Redirecting you to sign in...</p>
          </div>
        ) : !ready ? (
          <div className="rp-waiting">
            <p>Verifying your reset link...</p>
            <p className="rp-hint">If nothing happens, the link may have expired. <Link to="/auth">Request a new one</Link>.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rp-form">
            <div className="rp-field">
              <label>New Password</label>
              <div className="password-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={6} placeholder="••••••••"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>
            <div className="rp-field">
              <label>Confirm Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required minLength={6} placeholder="••••••••"
              />
            </div>
            {error && <p className="rp-error">{error}</p>}
            <button type="submit" className="rp-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </Motion.div>
    </div>
  );
};

export default ResetPassword;
