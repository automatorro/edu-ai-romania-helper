
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, AuthError, Session } from '@supabase/supabase-js';

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
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Helper function to get current origin for redirects
  const getCurrentOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  // Convert Supabase user to our User interface
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('Converting Supabase user:', supabaseUser.email);
      
      // First check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      // If no profile exists, it will be created by the database trigger
      // Let's wait a moment and try again
      if (!profile) {
        console.log('Profile not found, waiting for creation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (retryError) {
          console.error('Error fetching profile on retry:', retryError);
          return null;
        }

        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: retryProfile.name,
          userType: retryProfile.user_type,
          subscription: retryProfile.subscription,
          materialsCount: retryProfile.materials_count,
          materialsLimit: retryProfile.materials_limit,
          avatar: retryProfile.avatar_url,
          provider: retryProfile.provider
        };
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
    console.log('Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      
      if (session?.user) {
        // Use setTimeout to prevent potential deadlocks
        setTimeout(async () => {
          const convertedUser = await convertSupabaseUser(session.user);
          setUser(convertedUser);
          setIsLoading(false);
          
          // Show success toast for sign in events
          if (event === 'SIGNED_IN') {
            toast({
              title: "Autentificare reușită!",
              description: "Bine ai venit în EduAI!",
            });
          }
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      
      if (session?.user) {
        const convertedUser = await convertSupabaseUser(session.user);
        setUser(convertedUser);
      }
      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription...');
      subscription.unsubscribe();
    };
  }, [toast]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting email login for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Login error:', authError);
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
      console.log('Starting Google OAuth...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${getCurrentOrigin()}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) throw error;
      console.log('Google OAuth initiated successfully');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Google login error:', authError);
      toast({
        title: "Eroare",
        description: authError.message || "Nu am putut conecta cu Google.",
        variant: "destructive",
      });
    }
  };

  const loginWithFacebook = async () => {
    try {
      console.log('Starting Facebook OAuth...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${getCurrentOrigin()}/dashboard`,
          scopes: 'email',
        }
      });

      if (error) throw error;
      console.log('Facebook OAuth initiated successfully');
    } catch (error) {
      const authError = error as AuthError;
      console.error('Facebook login error:', authError);
      toast({
        title: "Eroare",
        description: authError.message || "Nu am putut conecta cu Facebook.",
        variant: "destructive",
      });
    }
  };

  const loginWithGithub = async () => {
    try {
      console.log('Starting GitHub OAuth...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${getCurrentOrigin()}/dashboard`,
          scopes: 'user:email',
        }
      });

      if (error) throw error;
      console.log('GitHub OAuth initiated successfully');
    } catch (error) {
      const authError = error as AuthError;
      console.error('GitHub login error:', authError);
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
      console.log('Attempting registration for:', email);
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
      console.error('Registration error:', authError);
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
      console.log('Logging out user...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Delogare reușită",
        description: "La revedere!",
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('Logout error:', authError);
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
      session,
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
