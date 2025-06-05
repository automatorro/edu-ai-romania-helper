
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEmailConfirmation = () => {
  const { toast } = useToast();

  const sendConfirmationEmail = async (email: string, name: string) => {
    try {
      console.log('Sending confirmation email via edge function...');
      
      // Generate confirmation URL
      const confirmationUrl = `${window.location.origin}/confirm-email`;
      
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email,
          name,
          confirmationUrl
        }
      });

      if (error) {
        console.error('Error calling confirmation email function:', error);
        throw error;
      }

      console.log('Confirmation email sent successfully:', data);
      
      toast({
        title: "Email de confirmare trimis!",
        description: `Am trimis un email de confirmare la ${email}. Verifică-ți inbox-ul.`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error sending confirmation email:', error);
      
      toast({
        title: "Eroare la trimiterea email-ului",
        description: "Nu am putut trimite email-ul de confirmare. Încearcă din nou.",
        variant: "destructive",
      });
      
      return { success: false, error: error.message };
    }
  };

  return { sendConfirmationEmail };
};
