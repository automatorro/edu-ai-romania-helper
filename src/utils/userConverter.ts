
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseUser, User } from '@/types/auth';

export const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  try {
    console.log('Converting Supabase user:', supabaseUser);
    
    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }

    // If no profile exists, create one
    if (!profile) {
      console.log('Profile not found, creating new profile...');
      
      const provider = supabaseUser.app_metadata?.provider || 'email';
      const fullName = supabaseUser.user_metadata?.full_name || 
                      supabaseUser.user_metadata?.name || 
                      supabaseUser.email?.split('@')[0] || 
                      'User';

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: supabaseUser.id,
          name: fullName,
          user_type: 'profesor',
          provider: provider,
          avatar_url: supabaseUser.user_metadata?.avatar_url
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return null;
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: newProfile.name,
        userType: newProfile.user_type,
        subscription: newProfile.subscription,
        materialsCount: newProfile.materials_count,
        materialsLimit: newProfile.materials_limit,
        avatar: newProfile.avatar_url,
        provider: newProfile.provider
      };
    }

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile.name,
      userType: profile.user_type,
      subscription: profile.subscription,
      materialsCount: profile.materials_count,
      materialsLimit: profile.materials_limit,
      avatar: profile.avatar_url,
      provider: profile.provider
    };
  } catch (error) {
    console.error('Error converting user:', error);
    return null;
  }
};
