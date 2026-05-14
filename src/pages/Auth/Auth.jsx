import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = mode === 'login'
      ? await signIn(form.email, form.password)
      : await signUp(form.email, form.password, form.fullName);
    setLoading(false);
    if (err) setError(err.message);
    else navigate(redirect);
  };

  const handleGoogle = async () => {
    setError('');
    const { error: err } = await signInWithGoogle();
    if (err) {
      const msg = err.message || '';
      if (msg.includes('provider is not enabled') || msg.includes('Unsupported provider')) {
        setError('Google sign-in is not available yet. Please use email and password.');
      } else {
        setError(msg);
      }
    }
  };

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
        <p className="auth-tag">Welcome</p>
        <h1 className="auth-headline">{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>

        <button className="google-btn" onClick={handleGoogle}>
          <FcGoogle className="google-icon" />
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

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
          <div className="auth-field">
            <label>Password</label>
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
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </Motion.div>
    </div>
  );
};

export default Auth;
