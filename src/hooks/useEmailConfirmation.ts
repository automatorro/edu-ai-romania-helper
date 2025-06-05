
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmailConfirmation = () => {
  const { toast } = useToast();

  const sendConfirmationEmail = async (email: string, name: string) => {
    try {
      console.log('📨 Attempting to send confirmation email...');
      console.log('📧 To email:', email);
      console.log('👤 For user:', name);
      
      // Verificăm dacă edge function există
      const confirmationUrl = `${window.location.origin}/confirm-email`;
      console.log('🔗 Confirmation URL:', confirmationUrl);
      
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          name,
          confirmationUrl
        }
      });

      console.log('📊 Email function response data:', data);
      console.log('❗ Email function response error:', error);

      if (error) {
        console.error('❌ Error calling confirmation email function:', error);
        throw error;
      }

      console.log('✅ Confirmation email sent successfully:', data);
      
      toast({
        title: "Email de confirmare trimis!",
        description: `Am trimis un email de confirmare la ${email}. Verifică-ți inbox-ul.`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('❌ Error sending confirmation email:', error);
      
      // Nu blocăm înregistrarea dacă email-ul nu poate fi trimis
      console.log('⚠️ Email sending failed, but continuing with registration process');
      
      toast({
        title: "Cont creat cu succes!",
        description: "Contul a fost creat. Email-ul de confirmare nu a putut fi trimis, dar poți accesa aplicația.",
        variant: "default",
      });
      
      return { success: false, error: error.message };
    }
  };

  return { sendConfirmationEmail };
};
