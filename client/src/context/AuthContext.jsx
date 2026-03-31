import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getProfile } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Loads the user's profile from Supabase and merges it with session data.
   * This is the single source of truth for the `user` object.
   */
  const loadUserProfile = useCallback(async (session) => {
    try {
      const profile = await getProfile(session.user.id);
      if (profile) {
        setUser({
          id: session.user.id,
          token: session.access_token, // Kept for any legacy references
          role: profile.role,
          ...profile,
          _id: profile.id,
        });
      } else {
        // Profile doesn't exist yet (new user mid-registration)
        // The Login page will call `login()` directly after creating the profile.
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user profile:', err.message);
      setUser(null);
    }
  }, []);

  /**
   * Force-refreshes the current user from the active Supabase session.
   * Called by Login.jsx after profile creation to avoid race conditions.
   */
  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await loadUserProfile(session);
  }, [loadUserProfile]);

  useEffect(() => {
    // 1. Check for an existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await loadUserProfile(session);
      }
      setLoading(false);
    });

    // 2. Listen to all future auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && event !== 'INITIAL_SESSION') {
          await loadUserProfile(session);
        } else if (!session) {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  /**
   * Called by Login.jsx immediately after OTP verification and profile creation,
   * bypassing any race condition with onAuthStateChange.
   */
  const login = useCallback((session, profile) => {
    setUser({
      id: session.user.id,
      token: session.access_token,
      role: profile.role,
      ...profile,
      _id: profile.id,
    });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
