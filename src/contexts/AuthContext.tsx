
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'profesor' | 'elev' | 'parinte';
  subscription: 'gratuit' | 'premium';
  materialsCount: number;
  materialsLimit: number;
  avatar?: string;
  provider?: 'email' | 'google' | 'facebook' | 'github';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  register: (email: string, password: string, name: string, userType: User['userType']) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simulare autentificare cu email/parolă
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        userType: 'profesor',
        subscription: 'gratuit',
        materialsCount: 2,
        materialsLimit: 5,
        provider: 'email'
      };
      
      setUser(mockUser);
      localStorage.setItem('eduai_user', JSON.stringify(mockUser));
      
      toast({
        title: "Autentificare reușită!",
        description: "Bine ai venit în EduAI!",
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Email sau parolă incorectă.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // Simulare autentificare cu Google
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        email: 'utilizator@gmail.com',
        name: 'Utilizator Google',
        userType: 'profesor',
        subscription: 'gratuit',
        materialsCount: 0,
        materialsLimit: 5,
        avatar: 'https://via.placeholder.com/40',
        provider: 'google'
      };
      
      setUser(mockUser);
      localStorage.setItem('eduai_user', JSON.stringify(mockUser));
      
      toast({
        title: "Autentificare reușită!",
        description: "Conectat cu Google!",
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut conecta cu Google.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // Simulare autentificare cu Facebook
  const loginWithFacebook = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: 'facebook_' + Math.random().toString(36).substr(2, 9),
        email: 'utilizator@facebook.com',
        name: 'Utilizator Facebook',
        userType: 'elev',
        subscription: 'gratuit',
        materialsCount: 0,
        materialsLimit: 5,
        avatar: 'https://via.placeholder.com/40',
        provider: 'facebook'
      };
      
      setUser(mockUser);
      localStorage.setItem('eduai_user', JSON.stringify(mockUser));
      
      toast({
        title: "Autentificare reușită!",
        description: "Conectat cu Facebook!",
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut conecta cu Facebook.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // Simulare autentificare cu GitHub
  const loginWithGithub = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser: User = {
        id: 'github_' + Math.random().toString(36).substr(2, 9),
        email: 'utilizator@github.com',
        name: 'Utilizator GitHub',
        userType: 'profesor',
        subscription: 'gratuit',
        materialsCount: 0,
        materialsLimit: 5,
        avatar: 'https://via.placeholder.com/40',
        provider: 'github'
      };
      
      setUser(mockUser);
      localStorage.setItem('eduai_user', JSON.stringify(mockUser));
      
      toast({
        title: "Autentificare reușită!",
        description: "Conectat cu GitHub!",
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut conecta cu GitHub.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const register = async (email: string, password: string, name: string, userType: User['userType']) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        userType,
        subscription: 'gratuit',
        materialsCount: 0,
        materialsLimit: 5,
        provider: 'email'
      };
      
      setUser(newUser);
      localStorage.setItem('eduai_user', JSON.stringify(newUser));
      
      toast({
        title: "Cont creat cu succes!",
        description: "Bine ai venit în EduAI!",
      });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut crea contul. Încearcă din nou.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eduai_user');
    toast({
      title: "Delogare reușită",
      description: "La revedere!",
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('eduai_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithGoogle,
      loginWithFacebook,
      loginWithGithub,
      register, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
