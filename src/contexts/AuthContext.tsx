
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

  // Convert Supabase user to our User interface
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('Converting Supabase user:', supabaseUser);
      
      // Check if profile exists
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      // If no profile exists, create one
      if (!profile) {
        console.log('Profile not found, creating new profile...');
        
        const provider = supabaseUser.app_metadata?.provider || 'email';
        const fullName = supabaseUser.user_metadata?.full_name || 
                        supabaseUser.user_metadata?.name || 
                        supabaseUser.email?.split('@')[0] || 
                        'User';

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            name: fullName,
            user_type: 'profesor',
            provider: provider,
            avatar_url: supabaseUser.user_metadata?.avatar_url
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }

        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: newProfile.name,
          userType: newProfile.user_type,
          subscription: newProfile.subscription,
          materialsCount: newProfile.materials_count,
          materialsLimit: newProfile.materials_limit,
          avatar: newProfile.avatar_url,
          provider: newProfile.provider
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
      console.log('Auth state changed:', event, 'User:', session?.user?.email);
      
      setSession(session);
      
      if (session?.user) {
        // Use setTimeout to prevent potential deadlocks
        setTimeout(async () => {
          try {
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
          } catch (error) {
            console.error('Error processing auth state change:', error);
            setIsLoading(false);
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
        try {
          const convertedUser = await convertSupabaseUser(session.user);
          setUser(convertedUser);
        } catch (error) {
          console.error('Error processing initial session:', error);
        }
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
        title: "Eroare la autentificare",
        description: authError.message || "Email sau parolă incorectă.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
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
          redirectTo: `${window.location.origin}/dashboard`
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
          redirectTo: `${window.location.origin}/dashboard`
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
