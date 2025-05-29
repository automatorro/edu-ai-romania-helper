import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, AuthError } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'profesor' | 'elev' | 'parinte';
  subscription: 'gratuit' | 'premium';
  materialsCount: number;
  materialsLimit: number;
  avatar?: string;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  register: (email: string, password: string, name: string, userType: User['userType']) => Promise<void>;
  logout: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Convert Supabase user to our User interface
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile.name,
        userType: profile.user_type,
        subscription: profile.subscription,
        materialsCount: profile.materials_count,
        materialsLimit: profile.materials_limit,
        avatar: profile.avatar_url,
        provider: profile.provider
      };
    } catch (error) {
      console.error('Error converting user:', error);
      return null;
    }
  };

  // Handle authentication state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        const convertedUser = await convertSupabaseUser(session.user);
        setUser(convertedUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const convertedUser = await convertSupabaseUser(session.user);
        setUser(convertedUser);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Autentificare reușită!",
        description: "Bine ai venit în EduAI!",
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Eroare",
        description: authError.message || "Email sau parolă incorectă.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Eroare",
        description: authError.message || "Nu am putut conecta cu Google.",
        variant: "destructive",
      });
    }
  };

  const loginWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Eroare",
        description: authError.message || "Nu am putut conecta cu Facebook.",
        variant: "destructive",
      });
    }
  };

  const loginWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Eroare",
        description: authError.message || "Nu am putut conecta cu GitHub.",
        variant: "destructive",
      });
    }
  };

  const register = async (email: string, password: string, name: string, userType: User['userType']) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            user_type: userType
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Verifică email-ul!",
          description: "Am trimis un link de confirmare la adresa ta de email.",
        });
      } else {
        toast({
          title: "Cont creat cu succes!",
          description: "Bine ai venit în EduAI!",
        });
      }
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Eroare",
        description: authError.message || "Nu am putut crea contul. Încearcă din nou.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Delogare reușită",
        description: "La revedere!",
      });
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "Eroare",
        description: authError.message || "Eroare la delogare.",
        variant: "destructive",
      });
    }
  };

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
