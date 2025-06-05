
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '@/types/auth';

export const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  if (!supabaseUser) {
    console.log('❌ No Supabase user provided to convert');
    return null;
  }

  try {
    console.log('🔄 Converting Supabase user:', supabaseUser.email);
    console.log('📋 User metadata:', JSON.stringify(supabaseUser.user_metadata, null, 2));
    console.log('📋 App metadata:', JSON.stringify(supabaseUser.app_metadata, null, 2));
    
    // Wait a moment to ensure trigger has processed
    console.log('⏳ Waiting for database trigger to process...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch the user's profile from the profiles table
    console.log('🔍 Fetching user profile from database...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .maybeSingle();

    console.log('📊 Profile query result:');
    console.log('✅ Profile data:', profile ? JSON.stringify(profile, null, 2) : 'No profile found');
    console.log('❗ Profile error:', profileError ? JSON.stringify(profileError, null, 2) : 'No error');

    // Fetch user role
    console.log('🔍 Fetching user role...');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabaseUser.id)
      .maybeSingle();

    console.log('📊 Role query result:');
    console.log('✅ Role data:', roleData ? JSON.stringify(roleData, null, 2) : 'No role found');
    console.log('❗ Role error:', roleError ? JSON.stringify(roleError, null, 2) : 'No error');

    const userRole = roleData?.role || 'user';

    if (profile) {
      console.log('✅ Profile found, creating user object...');
      const convertedUser = {
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
      console.log('✅ Converted user:', JSON.stringify(convertedUser, null, 2));
      return convertedUser;
    }

    // If no profile found, return minimal user with defaults
    console.log('⚠️ No profile found, creating minimal user...');
    const minimalUser = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || 
            supabaseUser.user_metadata?.name || 
            supabaseUser.email?.split('@')[0] || 'Utilizator',
      userType: (supabaseUser.user_metadata?.user_type as User['userType']) || 'profesor',
      subscription: 'gratuit' as const,
      materialsCount: 0,
      materialsLimit: 5,
      avatar: supabaseUser.user_metadata?.avatar_url,
      provider: supabaseUser.app_metadata?.provider || 'email',
      role: userRole
    };
    console.log('✅ Minimal user created:', JSON.stringify(minimalUser, null, 2));
    return minimalUser;
  } catch (error) {
    console.error('❌ Error converting Supabase user:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return null;
  }
};
