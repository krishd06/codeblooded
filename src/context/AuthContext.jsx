import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth Modal State: closed by default
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register'

  const openAuthModal = (mode = 'signin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  useEffect(() => {
    // 1. Check local demo session or active Supabase session on mount
    try {
      const storedDemo = localStorage.getItem('api_sentinel_demo_user');
      if (storedDemo) {
        const parsed = JSON.parse(storedDemo);
        setUser(parsed);
        setSession({ user: parsed, access_token: 'demo-token' });
        setLoading(false);
      }
    } catch (e) {
      console.warn('Error reading stored demo session', e);
    }

    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error('[API Sentinel Auth] Error fetching initial session:', error);
      }
      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('[API Sentinel Auth] Unexpected session error:', err);
      setLoading(false);
    });

    // 2. Subscribe to auth state updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setAuthModalOpen(false); // auto-close modal on successful login
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Supabase Auth Methods
  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signInWithPassword = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // 1-Click Demo Sign-In Method
  const DEMO_CREDENTIALS = {
    email: 'demo@apisentinel.dev',
    password: 'SentinelDemo2024!',
    fullName: 'Sentinel Demo Tester',
  };

  const signInWithDemo = async () => {
    try {
      // 1. Try signing in directly to Supabase with demo credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: DEMO_CREDENTIALS.email,
        password: DEMO_CREDENTIALS.password,
      });

      if (!error && data?.user) {
        setUser(data.user);
        setSession(data.session);
        setAuthModalOpen(false);
        return data.user;
      }

      // 2. If user doesn't exist, try auto-registering
      try {
        await supabase.auth.signUp({
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
          options: {
            data: { full_name: DEMO_CREDENTIALS.fullName },
          },
        });
        const retry = await supabase.auth.signInWithPassword({
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
        });
        if (retry.data?.user) {
          setUser(retry.data.user);
          setSession(retry.data.session);
          setAuthModalOpen(false);
          return retry.data.user;
        }
      } catch {
        // Fallback to local demo session below
      }

      // 3. Fallback to instant mock demo session (guarantees 100% demo success)
      const mockDemoUser = {
        id: '00000000-demo-sentinel-auth-user',
        email: DEMO_CREDENTIALS.email,
        user_metadata: {
          full_name: DEMO_CREDENTIALS.fullName,
        },
      };
      localStorage.setItem('api_sentinel_demo_user', JSON.stringify(mockDemoUser));
      setUser(mockDemoUser);
      setSession({ user: mockDemoUser, access_token: 'demo-token' });
      setAuthModalOpen(false);
      return mockDemoUser;
    } catch (err) {
      console.warn('Demo sign-in fallback activated:', err);
      const mockDemoUser = {
        id: '00000000-demo-sentinel-auth-user',
        email: DEMO_CREDENTIALS.email,
        user_metadata: {
          full_name: DEMO_CREDENTIALS.fullName,
        },
      };
      localStorage.setItem('api_sentinel_demo_user', JSON.stringify(mockDemoUser));
      setUser(mockDemoUser);
      setSession({ user: mockDemoUser, access_token: 'demo-token' });
      setAuthModalOpen(false);
      return mockDemoUser;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('api_sentinel_demo_user');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    authModalOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    setAuthMode,
    signUp,
    signInWithPassword,
    signInWithDemo,
    DEMO_CREDENTIALS,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
