import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase/client';
import './Auth.css';

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const switchMode = (next) => { setMode(next); setError(''); setSuccess(''); };

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

    const { error: err } = mode === 'login'
      ? await signIn(form.email, form.password)
      : await signUp(form.email, form.password, form.fullName);
    setLoading(false);
    if (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('invalid login credentials'))
        setError("Incorrect email or password. Don't have an account? Click Sign Up.");
      else if (msg.toLowerCase().includes('email not confirmed'))
        setError('Please check your email and confirm your account first.');
      else if (msg.toLowerCase().includes('user already registered'))
        setError('An account with this email already exists. Try signing in instead.');
      else
        setError(msg);
    } else {
      navigate(redirect);
    }
  };

  const handleGoogle = async () => {
    setError('');
    const { error: err } = await signInWithGoogle();
    if (err) {
      const msg = err.message || '';
      if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider'))
        setError('Google sign-in is not available yet. Please use email and password.');
      else setError(msg);
    }
  };

  const headings = { login: 'Sign In', signup: 'Create Account', forgot: 'Reset Password' };
  const tags     = { login: 'Welcome back', signup: 'Welcome', forgot: 'Forgot password?' };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo-link">
        <img src="/logo1.svg" alt="OnlyOne Hairboss" className="auth-logo" />
      </Link>

      <Motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="auth-tag">{tags[mode]}</p>
        <h1 className="auth-headline">{headings[mode]}</h1>

        {mode !== 'forgot' && (
          <>
            <button className="google-btn" onClick={handleGoogle}>
              <FcGoogle className="google-icon" />
              Continue with Google
            </button>
            <div className="auth-divider"><span>or</span></div>
          </>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="auth-field">
              <label>Full Name</label>
              <input name="fullName" type="text" value={form.fullName} onChange={handleChange} required placeholder="Your full name" />
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
          </div>

          {mode !== 'forgot' && (
            <div className="auth-field">
              <div className="auth-label-row">
                <label>Password</label>
                {mode === 'login' && (
                  <button type="button" className="auth-forgot-link" onClick={() => switchMode('forgot')}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="password-wrap">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  minLength={6}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                </button>
              </div>
            </div>
          )}

          {error   && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {mode === 'forgot' ? (
          <p className="auth-switch">
            Remember it? <button onClick={() => switchMode('login')}>Back to Sign In</button>
          </p>
        ) : (
          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        )}
      </Motion.div>
    </div>
  );
};

export default Auth;
