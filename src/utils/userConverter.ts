
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types/auth';

export const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  if (!supabaseUser) return null;

  try {
    console.log('Converting Supabase user:', supabaseUser.email);
    console.log('User metadata:', supabaseUser.user_metadata);
    
    // Fetch the user's profile from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .single();

    console.log('Profile query result:', { profile, profileError });

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      
      // If profile doesn't exist, this might be a new user whose trigger hasn't fired yet
      // Return a minimal user object and let the trigger create the profile
      if (profileError.code === 'PGRST116') {
        console.log('Profile not found for user, might be creating...');
        
        // Wait a bit and try again once in case the trigger is still processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', supabaseUser.id)
          .single();
        
        if (retryProfile) {
          console.log('Profile found on retry:', retryProfile);
          
          // Fetch user role
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', supabaseUser.id)
            .single();

          const userRole = roleData?.role || 'user';

          return {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: retryProfile.name || supabaseUser.email?.split('@')[0] || 'Utilizator',
            userType: retryProfile.user_type,
            subscription: retryProfile.subscription,
            materialsCount: retryProfile.materials_count,
            materialsLimit: retryProfile.materials_limit,
            avatar: retryProfile.avatar_url || supabaseUser.user_metadata?.avatar_url,
            provider: retryProfile.provider || supabaseUser.app_metadata?.provider || 'email',
            role: userRole
          };
        }
        
        // Still no profile, return minimal user
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.full_name || 
                supabaseUser.user_metadata?.name || 
                supabaseUser.email?.split('@')[0] || 'Utilizator',
          userType: 'profesor',
          subscription: 'gratuit',
          materialsCount: 0,
          materialsLimit: 5,
          avatar: supabaseUser.user_metadata?.avatar_url,
          provider: supabaseUser.app_metadata?.provider || 'email',
          role: 'user'
        };
      }
      return null;
    }

    // Fetch user role from user_roles table
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabaseUser.id)
      .single();

    const userRole = roleData?.role || 'user';

    console.log('Profile found:', profile);
    console.log('User role:', userRole);

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile.name || supabaseUser.email?.split('@')[0] || 'Utilizator',
      userType: profile.user_type,
      subscription: profile.subscription,
      materialsCount: profile.materials_count,
      materialsLimit: profile.materials_limit,
      avatar: profile.avatar_url || supabaseUser.user_metadata?.avatar_url,
      provider: profile.provider || supabaseUser.app_metadata?.provider || 'email',
      role: userRole
    };
  } catch (error) {
    console.error('Error converting Supabase user:', error);
    return null;
  }
};
