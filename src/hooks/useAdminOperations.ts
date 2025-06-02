
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminOperations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  // Get all users (admin only)
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Promote user to admin
  const promoteToAdmin = useMutation({
    mutationFn: async (userId: string) => {
      if (!isAdmin) {
        throw new Error('Doar administratorii pot face această operațiune');
      }

      // Check if user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        throw new Error('Utilizatorul este deja administrator');
      }

      // Add admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Succes",
        description: "Utilizatorul a fost promovat la administrator",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove admin role
  const removeAdminRole = useMutation({
    mutationFn: async (userId: string) => {
      if (!isAdmin) {
        throw new Error('Doar administratorii pot face această operațiune');
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Succes",
        description: "Rolul de administrator a fost eliminat",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Eroare",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    isAdmin,
    users,
    usersLoading,
    promoteToAdmin,
    removeAdminRole,
  };
};
