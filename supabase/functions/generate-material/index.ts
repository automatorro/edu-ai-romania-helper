
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateRequest } from './validation.ts';
import { generateContentWithGemini } from './geminiService.ts';
import { getUserProfile, saveMaterial } from './databaseService.ts';
import { GenerateMaterialRequest } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody: GenerateMaterialRequest = await req.json();
    const { materialType, subject, gradeLevel, difficulty, additionalInfo, testMode } = requestBody;
    
    console.log('Request body:', requestBody);
    
    validateRequest(requestBody);

    // Pentru modul de testare, nu verificăm autentificarea
    if (!testMode) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('Nu ești autentificat');
      }

      const { profile } = await getUserProfile(authHeader);

      // Check authorization - admins have unlimited access, others must be within limits
      if (profile.role !== 'admin' && profile.materials_count >= profile.materials_limit) {
        throw new Error('Ai atins limita de materiale generate. Upgrade la premium pentru mai multe materiale.');
      }
    }

    // Generate content using Gemini API
    const generatedContent = await generateContentWithGemini(
      materialType,
      subject,
      gradeLevel,
      difficulty,
      additionalInfo
    );

    // Pentru modul de testare, nu salvăm în baza de date
    if (testMode) {
      console.log('Test mode - returning generated content without saving');
      return new Response(
        JSON.stringify({ 
          success: true, 
          content: generatedContent,
          message: 'Material generat cu succes cu AI! (Mod testare - funcționalitate completă)'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Pentru utilizatorii autentificați, salvăm în baza de date
    const authHeader = req.headers.get('Authorization')!;
    const { material, isAdmin } = await saveMaterial(
      authHeader,
      materialType,
      subject,
      gradeLevel,
      difficulty,
      generatedContent,
      additionalInfo
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        material,
        message: isAdmin 
          ? 'Material generat cu succes! (Admin - generări nelimitate)' 
          : 'Material generat cu succes!'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Generate material error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Eroare necunoscută' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
