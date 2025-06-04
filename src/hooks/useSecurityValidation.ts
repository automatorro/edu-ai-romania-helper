
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SecurityValidationOptions {
  requiredRole?: 'admin' | 'user';
  redirectOnFailure?: boolean;
  showToastOnFailure?: boolean;
}

export const useSecurityValidation = (options: SecurityValidationOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    requiredRole,
    redirectOnFailure = false,
    showToastOnFailure = true
  } = options;

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const hasRequiredRole = !requiredRole || 
    (requiredRole === 'admin' && isAdmin) ||
    (requiredRole === 'user' && isAuthenticated);

  useEffect(() => {
    if (!hasRequiredRole && showToastOnFailure) {
      const message = !isAuthenticated 
        ? 'Trebuie să te autentifici pentru a accesa această pagină'
        : 'Nu ai permisiunile necesare pentru a accesa această funcționalitate';
      
      toast({
        title: "Acces restricționat",
        description: message,
        variant: "destructive",
      });
    }

    if (!hasRequiredRole && redirectOnFailure) {
      // Redirect logic could be implemented here
      console.warn('Security validation failed - redirect should be implemented');
    }
  }, [hasRequiredRole, isAuthenticated, showToastOnFailure, redirectOnFailure, toast]);

  return {
    isAuthenticated,
    isAdmin,
    hasRequiredRole,
    user
  };
};
