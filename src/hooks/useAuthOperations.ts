
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import type { AuthError, User } from '@/types/auth';

export const useAuthOperations = () => {
  const { toast } = useToast();
  const { sendConfirmationEmail } = useEmailConfirmation();

  const login = async (email: string, password: string) => {
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
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('Starting Google OAuth...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
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
          redirectTo: window.location.origin + '/dashboard'
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
          redirectTo: window.location.origin + '/dashboard'
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
    try {
      console.log('Attempting registration for:', email);
      console.log('User type:', userType);
      console.log('Name:', name);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            user_type: userType,
            name: name
          },
          emailRedirectTo: `${window.location.origin}/confirm-email`
        }
      });

      console.log('Registration response:', { data, error });

      if (error) {
        console.error('Registration error details:', error);
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        // Send custom confirmation email
        await sendConfirmationEmail(email, name);
        
        toast({
          title: "Cont creat cu succes!",
          description: "Verifică email-ul pentru a-ți confirma contul.",
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
      
      let errorMessage = "Nu am putut crea contul. Încearcă din nou.";
      
      if (authError.message?.includes('already registered')) {
        errorMessage = "Acest email este deja înregistrat. Încearcă să te autentifici.";
      } else if (authError.message?.includes('Database error')) {
        errorMessage = "Eroare de bază de date. Te rugăm să încerci din nou în câteva momente.";
      } else if (authError.message?.includes('User already registered')) {
        errorMessage = "Acest email este deja înregistrat. Încearcă să te autentifici.";
      }
      
      toast({
        title: "Eroare la înregistrare",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
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

  return {
    login,
    loginWithGoogle: async () => {
      try {
        console.log('Starting Google OAuth...');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + '/dashboard',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            }
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
    },
    loginWithFacebook: async () => {
      try {
        console.log('Starting Facebook OAuth...');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: window.location.origin + '/dashboard'
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
    },
    loginWithGithub: async () => {
      try {
        console.log('Starting GitHub OAuth...');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: window.location.origin + '/dashboard'
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
    },
    register,
    logout
  };
};
