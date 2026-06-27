import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { syncSignupMetadata } from '../utils/supabase/billingApi';
import { sendEmail } from '../utils/email';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Intercept Google OAuth token from URL query params
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('hairboss_token', urlToken);
      // Clean URL parameters
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
    }

    let active = true;

    // Register onAuthStateChange FIRST.
    // Supabase always fires INITIAL_SESSION when this is registered, which
    // covers existing sessions (page refresh) and OAuth redirects
    // (the #access_token fragment is processed before this callback fires).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        if (!active) return;

        setUser(currentUser);

        if (currentUser) {
          setLoading(true);
          const profileData = await fetchProfile(currentUser.id);
          if (active) {
            setProfile(profileData);
            setLoading(false);
            // SIGNED_IN fires for both email/password and Google OAuth logins
            if (event === 'SIGNED_IN') {
              syncSignupMetadata({}).catch(() => {});
            }
          }
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (!error && data.user) {
      syncSignupMetadata({ full_name: fullName }).catch(() => {});
      sendEmail('welcome', { email: data.user.email, name: fullName || data.user.email });
    }
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // After Google authenticates, Supabase redirects here.
        // This URL must be in: Supabase Dashboard → Auth → URL Configuration → Redirect URLs
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
