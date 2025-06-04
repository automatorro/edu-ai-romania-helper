
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserMaterials = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['materials', user?.id],
    queryFn: async () => {
      // Check if user is authenticated
      if (!user) {
        throw new Error('Nu ești autentificat');
      }

      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching materials:', error);
        throw new Error('Eroare la încărcarea materialelor');
      }

      return data || [];
    },
    enabled: !!user,
  });
};
