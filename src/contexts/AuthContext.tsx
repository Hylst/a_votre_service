
import React, { createContext, useContext, useEffect, useState, startTransition } from 'react';

// Local user interface for localStorage-based authentication
interface LocalUser {
  id: string;
  fullName: string;
  password: string;
  createdAt: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: LocalUser | null;
  session: LocalUser | null;
  loading: boolean;
  signIn: (fullName: string, password: string) => Promise<{ error: any }>;
  signUp: (fullName: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [session, setSession] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage on component mount
    const checkCurrentUser = () => {
      try {
        console.log('🔍 AuthContext: Checking for existing user in localStorage');
        const currentUserData = localStorage.getItem('currentUser');
        console.log('🔍 AuthContext: currentUser data:', currentUserData);
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          console.log('🔍 AuthContext: Parsed user data:', userData);
          setUser(userData);
          setSession(userData);
          console.log('✅ AuthContext: User loaded from localStorage');
        } else {
          console.log('❌ AuthContext: No user found in localStorage');
        }
      } catch (error) {
        console.error('💥 AuthContext: Error loading user from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('currentUser');
      } finally {
        setLoading(false);
        console.log('🔍 AuthContext: Loading finished, loading set to false');
      }
    };

    checkCurrentUser();

    // Listen for storage changes (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        if (e.newValue) {
          const userData = JSON.parse(e.newValue);
          setUser(userData);
          setSession(userData);
        } else {
          setUser(null);
          setSession(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const signIn = async (fullName: string, password: string) => {
    try {
      console.log('🔐 SignIn attempt for:', fullName);
      
      // Check users in localStorage
      const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const foundUser = users.find((u: LocalUser) => u.fullName === fullName && u.password === password);
      
      if (!foundUser) {
        console.log('❌ User not found or wrong password');
        return { error: new Error('Nom d\'utilisateur ou mot de passe incorrect') };
      }
      
      console.log('✅ User found, updating state:', foundUser);
      
      // Store current user
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      
      // Force immediate state update
      startTransition(() => {
        setUser(foundUser);
        setSession(foundUser);
      });
      
      // Also trigger a manual re-render by updating loading state
      setLoading(false);
      
      console.log('🎉 SignIn successful, state updated');
      return { error: null };
    } catch (error) {
      console.error('💥 SignIn error:', error);
      return { error: error instanceof Error ? error : new Error('Erreur lors de la connexion') };
    }
  };

  const signUp = async (fullName: string, password: string) => {
    try {
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const existingUser = users.find((u: LocalUser) => u.fullName === fullName);
      
      if (existingUser) {
        return { error: new Error('Ce nom d\'utilisateur est déjà utilisé.') };
      }
      
      // Create new user
      const newUser: LocalUser = {
        id: Date.now().toString(),
        fullName,
        password,
        createdAt: new Date().toISOString(),
        full_name: fullName
      };
      
      users.push(newUser);
      localStorage.setItem('localUsers', JSON.stringify(users));
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Erreur lors de l\'inscription') };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    if (!user) return { error: new Error('No user') };
    
    try {
      // Update user data
      const updatedUser = { ...user, ...data };
      
      // Update in localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update in users list
      const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
      const userIndex = users.findIndex((u: LocalUser) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('localUsers', JSON.stringify(users));
      }
      
      setUser(updatedUser);
      setSession(updatedUser);
      
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Erreur lors de la mise à jour du profil') };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
