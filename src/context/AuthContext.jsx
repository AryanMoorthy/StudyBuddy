import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = useRef(null); // Track user ID to prevent duplicate updates

  useEffect(() => {
    // Developer bypass
    const isDevBypass = import.meta.env.DEV && localStorage.getItem('devBypass') === 'true';
    if (isDevBypass) {
      setUser({ id: 'dev-user', email: 'dev@studybuddy.ai' });
      setLoading(false);
      return;
    }

    // Initial session fetch
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const newUser = session?.user ?? null;
      currentUserId.current = newUser?.id ?? null;
      setUser(newUser);
      setLoading(false);
    };

    getSession();

    // Only update when user identity CHANGES — ignore token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      const newId = newUser?.id ?? null;

      // Skip if same user — prevents token refresh from cascading
      if (newId === currentUserId.current) return;

      currentUserId.current = newId;
      setUser(newUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = (email, password) => supabase.auth.signUp({ email, password });
  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const logout = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
