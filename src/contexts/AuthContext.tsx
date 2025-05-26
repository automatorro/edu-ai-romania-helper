
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
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
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

  // Simulare autentificare - în aplicația reală va fi înlocuită cu Supabase
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulare delay API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        userType: 'profesor',
        subscription: 'gratuit',
        materialsCount: 2,
        materialsLimit: 5
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
        materialsLimit: 5
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
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
