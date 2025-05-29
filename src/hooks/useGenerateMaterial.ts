
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  return useMutation({
    mutationFn: async (request: GenerateMaterialRequest) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Nu ești autentificat');
      }

      const response = await supabase.functions.invoke('generate-material', {
        body: request,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Material generat cu succes!",
        description: "Materialul a fost salvat în contul tău.",
      });
      
      // Invalidate materials query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
