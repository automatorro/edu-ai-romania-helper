
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import type { AuthError, User } from '@/types/auth';

export const useAuthOperations = () => {
  const { toast } = useToast();
  const { sendConfirmationEmail } = useEmailConfirmation();

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Starting login for:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('✅ Login successful for:', email);
    } catch (error) {
      const authError = error as AuthError;
      console.error('❌ Login error:', authError);
      toast({
        title: "Eroare la autentificare",
        description: authError.message || "Email sau parolă incorectă.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, userType: User['userType']) => {
    try {
      console.log('📝 Starting registration...');
      console.log('📧 Email:', email);
      console.log('👤 Name:', name);
      console.log('🏷️ User type:', userType);
      
      // Simplificăm - nu trimitem email de confirmare automat
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            user_type: userType,
            name: name
          }
          // Eliminăm emailRedirectTo deocamdată pentru simplificare
        }
      });

      console.log('📊 Registration response data:', data);
      console.log('❗ Registration response error:', error);

      if (error) {
        console.error('❌ Registration error details:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.id);
        
        // Încercăm să trimitem email de confirmare manual doar dacă utilizatorul a fost creat
        try {
          await sendConfirmationEmail(email, name);
          console.log('📨 Confirmation email sent');
        } catch (emailError) {
          console.error('⚠️ Email sending failed, but user was created:', emailError);
        }
        
        toast({
          title: "Cont creat cu succes!",
          description: "Verifică email-ul pentru a-ți confirma contul.",
        });
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error('❌ Registration error:', authError);
      
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
      console.log('🚪 Logging out user...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Delogare reușită",
        description: "La revedere!",
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('❌ Logout error:', authError);
      toast({
        title: "Eroare",
        description: authError.message || "Eroare la delogare.",
        variant: "destructive",
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('🔍 Starting Google OAuth...');
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
      console.log('✅ Google OAuth initiated successfully');
    } catch (error) {
      const authError = error as AuthError;
      console.error('❌ Google login error:', authError);
      toast({
        title: "Eroare",
        description: authError.message || "Nu am putut conecta cu Google.",
        variant: "destructive",
      });
    }
  };

  const loginWithFacebook = async () => {
    try {
      console.log('📘 Starting Facebook OAuth...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });

      if (error) throw error;
      console.log('✅ Facebook OAuth initiated successfully');
    } catch (error) {
      const authError = error as AuthError;
      console.error('❌ Facebook login error:', authError);
      toast({
        title: "Eroare",
        description: authError.message || "Nu am putut conecta cu Facebook.",
        variant: "destructive",
      });
    }
  };

  const loginWithGithub = async () => {
    try {
      console.log('🐱 Starting GitHub OAuth...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });

      if (error) throw error;
      console.log('✅ GitHub OAuth initiated successfully');
    } catch (error) {
      const authError = error as AuthError;
      console.error('❌ GitHub login error:', authError);
      toast({
        title: "Eroare",
        description: authError.message || "Nu am putut conecta cu GitHub.",
        variant: "destructive",
      });
    }
  };

  return {
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithGithub,
    register,
    logout
  };
};
