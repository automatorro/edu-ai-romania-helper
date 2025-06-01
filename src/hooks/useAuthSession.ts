
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { convertSupabaseUser } from '@/utils/userConverter';
import type { User, Session } from '@/types/auth';

export const useAuthSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
          setIsLoading(false);
          return;
        }

        console.log('Initial session:', session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          console.log('Processing initial session user...');
          const convertedUser = await convertSupabaseUser(session.user);
          setUser(convertedUser);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'User:', session?.user?.email);
      
      setSession(session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, processing...');
        setIsLoading(true);
        try {
          const convertedUser = await convertSupabaseUser(session.user);
          setUser(convertedUser);
          
          if (convertedUser) {
            toast({
              title: "Autentificare reușită!",
              description: "Bine ai venit în EduAI!",
            });
          }
        } catch (error) {
          console.error('Error processing signed in user:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed, updating user data...');
        if (session?.user) {
          const convertedUser = await convertSupabaseUser(session.user);
          setUser(convertedUser);
        }
      }
    });

    return () => {
      console.log('Cleaning up auth subscription...');
      subscription.unsubscribe();
    };
  }, [toast]);

  return { user, session, isLoading, setUser, setIsLoading };
};
