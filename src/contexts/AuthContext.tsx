
import React, { createContext, useContext } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import type { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, isLoading, setIsLoading } = useAuthSession();
  const authOperations = useAuthOperations();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authOperations.login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, userType: 'profesor' | 'elev' | 'parinte') => {
    setIsLoading(true);
    try {
      await authOperations.register(email, password, name, userType);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      login, 
      loginWithGoogle: authOperations.loginWithGoogle,
      loginWithFacebook: authOperations.loginWithFacebook,
      loginWithGithub: authOperations.loginWithGithub,
      register, 
      logout: authOperations.logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
