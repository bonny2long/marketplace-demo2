'use client'; // This is a client component as it uses React hooks and Supabase client-side

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js'; // Supabase User type
import { supabase } from '@/lib/supabase'; // Your Supabase client instance

// Define the shape of our AuthContext
interface AuthContextType {
  user: User | null; // The authenticated user, or null if not logged in
  loading: boolean; // True while checking auth state
  // You might add signIn, signOut functions here later if you want to expose them globally
}

// Create the AuthContext with a default null value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap your application
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Initial loading state for auth check

  useEffect(() => {
    // Function to get the initial session and set up the listener
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting initial session:', error);
      } else if (session) {
        setUser(session.user);
      }
      setLoading(false); // Initial check complete
    };

    getSession();

    // Set up the Supabase auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false); // Ensure loading is false after any auth state change
    });

    // Clean up the listener when the component unmounts
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily consume the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
