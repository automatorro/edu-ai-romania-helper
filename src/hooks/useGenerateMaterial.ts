
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GenerateMaterialRequest {
  materialType: 'quiz' | 'plan_lectie' | 'prezentare' | 'analogie' | 'evaluare';
  subject: string;
  gradeLevel: string;
  difficulty: string;
  additionalInfo?: string;
}

export const useGenerateMaterial = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (request: GenerateMaterialRequest) => {
      // Validate request parameters
      if (!request.materialType || !request.subject || !request.gradeLevel || !request.difficulty) {
        throw new Error('Toate câmpurile obligatorii trebuie completate');
      }

      const validTypes = ['quiz', 'plan_lectie', 'prezentare', 'analogie', 'evaluare'];
      if (!validTypes.includes(request.materialType)) {
        throw new Error('Tipul de material nu este valid');
      }

      // Pentru testing - generăm cu AI chiar și fără user
      if (!user) {
        console.log('🎯 Generating material with AI without authentication (test mode)');
        
        // Call the edge function directly with a test session
        const response = await supabase.functions.invoke('generate-material', {
          body: {
            ...request,
            testMode: true // Flag pentru edge function să știe că e test
          }
        });

        if (response.error) {
          console.error('Edge function error:', response.error);
          throw new Error(response.error.message || 'Eroare la generarea materialului');
        }

        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Eroare necunoscută la generarea materialului');
        }

        return {
          success: true,
          message: "Material generat cu succes! (Mod testare fără cont)",
          data: {
            id: 'test-' + Date.now(),
            type: request.materialType,
            subject: request.subject,
            difficulty: request.difficulty,
            content: response.data.content,
            created_at: new Date().toISOString()
          }
        };
      }

      // Dacă există user, procedura normală cu verificări
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sesiunea a expirat. Te rugăm să te autentifici din nou.');
      }

      // Check rate limits for non-admin users
      if (user.role !== 'admin' && user.materialsCount >= user.materialsLimit) {
        throw new Error('Ai atins limita de materiale generate. Upgrade la premium pentru mai multe materiale.');
      }

      // Call the edge function with proper error handling
      const response = await supabase.functions.invoke('generate-material', {
        body: request,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error('Edge function error:', response.error);
        throw new Error(response.error.message || 'Eroare la generarea materialului');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Eroare necunoscută la generarea materialului');
      }

      return response.data;
    },
    onSuccess: (data) => {
      const message = data.message || (user?.role === 'admin' 
        ? "Material generat cu succes! (Admin - generări nelimitate)" 
        : user 
          ? "Material generat cu succes!"
          : "Material generat cu succes! (Mod testare - funcționalitate completă)");
      
      toast({
        title: "Succes!",
        description: message,
      });
      
      // Invalidate and refetch queries doar dacă avem user
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['materials'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      }
    },
    onError: (error: Error) => {
      console.error('Generate material error:', error);
      toast({
        title: "Eroare",
        description: error.message || 'A apărut o eroare la generarea materialului',
        variant: "destructive",
      });
    },
  });
};
