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
      console.log('🔥 STARTING REGISTRATION PROCESS');
      console.log('📧 Email:', email);
      console.log('👤 Name:', name);
      console.log('🏷️ User type:', userType);
      
      // Verificăm starea inițială
      console.log('🔍 Checking Supabase client configuration...');
      console.log('🔗 Supabase URL:', supabase.supabaseUrl);
      console.log('🔑 Supabase Key exists:', !!supabase.supabaseKey);
      
      console.log('📝 Attempting Supabase auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            user_type: userType,
            name: name
          }
        }
      });

      console.log('📊 Supabase signUp response:');
      console.log('✅ Data:', JSON.stringify(data, null, 2));
      console.log('❗ Error:', error ? JSON.stringify(error, null, 2) : 'No error');

      if (error) {
        console.error('❌ Supabase signUp error details:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error status:', error.status);
        throw error;
      }

      if (data.user) {
        console.log('✅ User object created successfully:');
        console.log('🆔 User ID:', data.user.id);
        console.log('📧 User email:', data.user.email);
        console.log('📋 User metadata:', JSON.stringify(data.user.user_metadata, null, 2));
        console.log('📋 App metadata:', JSON.stringify(data.user.app_metadata, null, 2));
        console.log('✉️ Email confirmed:', data.user.email_confirmed_at ? 'YES' : 'NO');
        
        // Verificăm dacă sesiunea este creată
        if (data.session) {
          console.log('🎫 Session created:', !!data.session);
          console.log('🎫 Access token exists:', !!data.session.access_token);
        } else {
          console.log('⚠️ No session created - user needs email confirmation');
        }
        
        toast({
          title: "Cont creat cu succes!",
          description: "Contul a fost creat. Poți începe să folosești aplicația.",
        });
      } else {
        console.error('❌ No user object in response despite no error');
        throw new Error('User creation failed - no user object returned');
      }
    } catch (error) {
      const authError = error as AuthError;
      console.error('❌ Registration error caught:', authError);
      console.error('❌ Error type:', typeof authError);
      console.error('❌ Error constructor:', authError.constructor.name);
      
      let errorMessage = "Nu am putut crea contul. Încearcă din nou.";
      
      if (authError.message?.includes('already registered')) {
        errorMessage = "Acest email este deja înregistrat. Încearcă să te autentifici.";
      } else if (authError.message?.includes('Database error')) {
        errorMessage = "Eroare de bază de date. Te rugăm să încerci din nou în câteva momente.";
      } else if (authError.message?.includes('User already registered')) {
        errorMessage = "Acest email este deja înregistrat. Încearcă să te autentifici.";
      } else if (authError.message?.includes('relation') && authError.message?.includes('does not exist')) {
        errorMessage = "Eroare de configurare bază de date. Contactează administratorul.";
        console.error('🚨 DATABASE SCHEMA ERROR - missing table or relation');
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
