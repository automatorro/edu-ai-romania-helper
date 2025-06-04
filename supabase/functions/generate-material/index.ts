
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Nu ești autentificat')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Token invalid sau expirat')
    }

    // Get user profile with role information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Profilul utilizatorului nu a fost găsit')
    }

    // Check authorization - admins have unlimited access, others must be within limits
    if (profile.role !== 'admin' && profile.materials_count >= profile.materials_limit) {
      throw new Error('Ai atins limita de materiale generate. Upgrade la premium pentru mai multe materiale.')
    }

    // Parse and validate request body
    const { materialType, subject, gradeLevel, difficulty, additionalInfo } = await req.json()
    
    if (!materialType || !subject || !gradeLevel || !difficulty) {
      throw new Error('Parametrii obligatorii lipsesc')
    }

    // Validate material type
    const validTypes = ['quiz', 'plan_lectie', 'prezentare', 'analogie', 'evaluare']
    if (!validTypes.includes(materialType)) {
      throw new Error('Tipul de material nu este valid')
    }

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Configurarea serverului este incompletă')
    }

    // Generate content using Gemini API
    const prompt = createPrompt(materialType, subject, gradeLevel, difficulty, additionalInfo)
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error('Eroare la generarea conținutului')
    }

    const aiResponse = await response.json()
    const generatedContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedContent) {
      throw new Error('Nu s-a putut genera conținutul')
    }

    // Create material title
    const title = `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} - ${subject} (Clasa ${gradeLevel})`

    // Save material to database
    const { data: material, error: saveError } = await supabase
      .from('materials')
      .insert({
        user_id: user.id,
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
      .single()

    if (saveError) {
      console.error('Database save error:', saveError)
      throw new Error('Eroare la salvarea materialului')
    }

    // Update materials count (only for non-admin users)
    if (profile.role !== 'admin') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ materials_count: profile.materials_count + 1 })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Count update error:', updateError)
        // Don't fail the request for this
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        material,
        message: profile.role === 'admin' ? 'Material generat cu succes! (Admin - generări nelimitate)' : 'Material generat cu succes!'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Generate material error:', error)
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
    )
  }
})

function createPrompt(materialType: string, subject: string, gradeLevel: string, difficulty: string, additionalInfo?: string): string {
  const basePrompt = `Generează un ${materialType} pentru disciplina ${subject}, destinat clasei a ${gradeLevel}-a, cu nivelul de dificultate ${difficulty}.`
  
  const additionalContext = additionalInfo ? `\n\nInformații suplimentare: ${additionalInfo}` : ''
  
  const specificInstructions = {
    quiz: 'Creează un quiz cu 10 întrebări cu variante multiple de răspuns (A, B, C, D). Include răspunsurile corecte la sfârșitul quiz-ului.',
    plan_lectie: 'Creează un plan de lecție detaliat cu obiective, activități, resurse necesare și evaluare. Structurează-l în secțiuni clare.',
    prezentare: 'Creează o prezentare structurată cu slide-uri, incluzând introducere, dezvoltare și concluzii. Menționează punctele cheie pentru fiecare slide.',
    analogie: 'Creează analogii creative și ușor de înțeles care să explice conceptele complexe prin comparații cu situații familiare elevilor.',
    evaluare: 'Creează o evaluare cu întrebări variate (întrebări scurte, dezvoltare, probleme practice). Include baremul de notare.'
  }

  return `${basePrompt}\n\n${specificInstructions[materialType as keyof typeof specificInstructions] || 'Generează materialul educațional solicitat.'}${additionalContext}\n\nRăspunde în limba română și asigură-te că conținutul este potrivit pentru nivelul specificat.`
}
