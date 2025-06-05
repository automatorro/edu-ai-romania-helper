
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { UserProfile } from './types.ts';

export async function getUserProfile(authHeader: string): Promise<{ user: any; profile: UserProfile }> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    throw new Error('Token invalid sau expirat');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Profilul utilizatorului nu a fost găsit');
  }

  return { user, profile };
}

export async function saveMaterial(
  authHeader: string,
  materialType: string,
  subject: string,
  gradeLevel: string,
  difficulty: string,
  generatedContent: string,
  additionalInfo?: string
) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);

  const title = `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} - ${subject} (Clasa ${gradeLevel})`;

  const { data: material, error: saveError } = await supabase
    .from('materials')
    .insert({
      user_id: user!.id,
      title,
      material_type: materialType,
      subject,
      grade_level: gradeLevel,
      difficulty,
      content: {
        generated_content: generatedContent,
        additional_info: additionalInfo
      }
    })
    .select()
    .single();

  if (saveError) {
    console.error('Database save error:', saveError);
    throw new Error('Eroare la salvarea materialului');
  }

  // Update materials count (only for non-admin users)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user!.id)
    .single();

  if (profile?.role !== 'admin') {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ materials_count: supabase.sql`materials_count + 1` })
      .eq('user_id', user!.id);

    if (updateError) {
      console.error('Count update error:', updateError);
    }
  }

  return { material, isAdmin: profile?.role === 'admin' };
}
