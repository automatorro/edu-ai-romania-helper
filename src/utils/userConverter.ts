
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types/auth';

export const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  if (!supabaseUser) return null;

  try {
    console.log('Converting Supabase user:', supabaseUser.email);
    console.log('User metadata:', supabaseUser.user_metadata);
    
    // Wait a moment to ensure trigger has processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fetch the user's profile from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .maybeSingle();

    console.log('Profile query result:', { profile, profileError });

    // Fetch user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabaseUser.id)
      .maybeSingle();

    const userRole = roleData?.role || 'user';

    if (profile) {
      console.log('Profile found:', profile);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile.name || supabaseUser.email?.split('@')[0] || 'Utilizator',
        userType: profile.user_type || 'profesor',
        subscription: profile.subscription || 'gratuit',
        materialsCount: profile.materials_count || 0,
        materialsLimit: profile.materials_limit || 5,
        avatar: profile.avatar_url || supabaseUser.user_metadata?.avatar_url,
        provider: profile.provider || supabaseUser.app_metadata?.provider || 'email',
        role: userRole
      };
    }

    // If no profile found, return minimal user with defaults
    console.log('No profile found, returning minimal user');
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || 
            supabaseUser.user_metadata?.name || 
            supabaseUser.email?.split('@')[0] || 'Utilizator',
      userType: (supabaseUser.user_metadata?.user_type as User['userType']) || 'profesor',
      subscription: 'gratuit',
      materialsCount: 0,
      materialsLimit: 5,
      avatar: supabaseUser.user_metadata?.avatar_url,
      provider: supabaseUser.app_metadata?.provider || 'email',
      role: userRole
    };
  } catch (error) {
    console.error('Error converting Supabase user:', error);
    return null;
  }
};
