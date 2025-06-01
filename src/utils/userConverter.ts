
import { supabase } from '@/integrations/supabase/client';
import type { SupabaseUser, User } from '@/types/auth';

export const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  try {
    console.log('Converting Supabase user:', supabaseUser);
    
    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }

    // If profile exists, return the converted user
    if (profile) {
      console.log('Profile found:', profile);
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
    }

    // If no profile exists, the trigger should have created one
    // Wait a moment and try again
    console.log('Profile not found, waiting for trigger to create it...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: newProfile, error: retryError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .single();

    if (retryError) {
      console.error('Profile still not found after retry:', retryError);
      return null;
    }

    if (newProfile) {
      console.log('Profile found after retry:', newProfile);
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

    return null;
  } catch (error) {
    console.error('Error converting user:', error);
    return null;
  }
};
