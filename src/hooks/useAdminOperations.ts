
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
      // Double-check admin authorization
      if (!isAdmin) {
        throw new Error('Nu ai permisiuni de administrator');
      }
      
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
      // Authorization check
      if (!isAdmin) {
        throw new Error('Doar administratorii pot face această operațiune');
      }

      // Validate userId
      if (!userId || typeof userId !== 'string') {
        throw new Error('ID utilizator invalid');
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

      if (error) {
        console.error('Error promoting user to admin:', error);
        throw new Error('Eroare la promovarea utilizatorului');
      }

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Succes",
        description: "Utilizatorul a fost promovat la administrator",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      console.error('Promote to admin error:', error);
      toast({
        title: "Eroare",
        description: error.message || 'Eroare la promovarea utilizatorului',
        variant: "destructive",
      });
    },
  });

  // Remove admin role
  const removeAdminRole = useMutation({
    mutationFn: async (userId: string) => {
      // Authorization check
      if (!isAdmin) {
        throw new Error('Doar administratorii pot face această operațiune');
      }

      // Validate userId
      if (!userId || typeof userId !== 'string') {
        throw new Error('ID utilizator invalid');
      }

      // Prevent removing admin role from current user
      if (userId === user?.id) {
        throw new Error('Nu îți poți elimina propriul rol de administrator');
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        console.error('Error removing admin role:', error);
        throw new Error('Eroare la eliminarea rolului de administrator');
      }

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Succes",
        description: "Rolul de administrator a fost eliminat",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      console.error('Remove admin role error:', error);
      toast({
        title: "Eroare",
        description: error.message || 'Eroare la eliminarea rolului de administrator',
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
