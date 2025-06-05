
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
    // Parse request body
    const requestBody = await req.json()
    const { materialType, subject, gradeLevel, difficulty, additionalInfo, testMode } = requestBody
    
    console.log('Request body:', requestBody)
    
    if (!materialType || !subject || !gradeLevel || !difficulty) {
      throw new Error('Parametrii obligatorii lipsesc')
    }

    // Validate material type
    const validTypes = ['quiz', 'plan_lectie', 'prezentare', 'analogie', 'evaluare']
    if (!validTypes.includes(materialType)) {
      throw new Error('Tipul de material nu este valid')
    }

    // Pentru modul de testare, nu verificăm autentificarea
    if (!testMode) {
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
    }

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment')
      throw new Error('Configurarea serverului este incompletă - cheia API lipsește')
    }

    console.log('Gemini API key found, generating content...')

    // Generate content using Gemini API with correct model
    const prompt = createPrompt(materialType, subject, gradeLevel, difficulty, additionalInfo)
    console.log('Generated prompt:', prompt.substring(0, 200) + '...')
    
    // Updated URL and model for Gemini 1.5 Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`
    console.log('Making request to Gemini API with model gemini-1.5-flash...')
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    console.log('Gemini API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error response:', errorText)
      throw new Error(`Eroare API Gemini: ${response.status} - ${errorText}`)
    }

    const aiResponse = await response.json()
    console.log('Gemini API response received:', !!aiResponse.candidates)
    
    const generatedContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text

    if (!generatedContent) {
      console.error('No content generated:', aiResponse)
      throw new Error('Nu s-a putut genera conținutul - răspuns gol de la AI')
    }

    console.log('Content generated successfully, length:', generatedContent.length)

    // Pentru modul de testare, nu salvăm în baza de date
    if (testMode) {
      console.log('Test mode - returning generated content without saving')
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
      )
    }

    // Pentru utilizatorii autentificați, salvăm în baza de date
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from token again for saving
    const authHeader = req.headers.get('Authorization')
    const token = authHeader!.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    // Create material title
    const title = `${materialType.charAt(0).toUpperCase() + materialType.slice(1)} - ${subject} (Clasa ${gradeLevel})`

    // Save material to database
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
      .single()

    if (saveError) {
      console.error('Database save error:', saveError)
      throw new Error('Eroare la salvarea materialului')
    }

    // Update materials count (only for non-admin users)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user!.id)
      .single()

    if (profile?.role !== 'admin') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ materials_count: supabase.sql`materials_count + 1` })
        .eq('user_id', user!.id)

      if (updateError) {
        console.error('Count update error:', updateError)
        // Don't fail the request for this
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        material,
        message: profile?.role === 'admin' ? 'Material generat cu succes! (Admin - generări nelimitate)' : 'Material generat cu succes!'
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
    quiz: 'Creează un quiz cu 10 întrebări cu variante multiple de răspuns (A, B, C, D). Include răspunsurile corecte și explicațiile la sfârșitul quiz-ului. Formatează răspunsul în JSON cu structura: {"title": "...", "questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]}',
    plan_lectie: 'Creează un plan de lecție detaliat cu obiective, activități, resurse necesare și evaluare. Structurează-l în secțiuni claire. Formatează răspunsul în JSON cu structura: {"title": "...", "duration": "...", "objectives": [...], "activities": [{"name": "...", "duration": "...", "description": "..."}], "resources": [...], "evaluation": "..."}',
    prezentare: 'Creează o prezentare structurată cu slide-uri, incluzând introducere, dezvoltare și concluzii. Menționează punctele cheie pentru fiecare slide. Formatează răspunsul în JSON cu structura: {"title": "...", "slides": [{"title": "...", "content": "..."}]}',
    analogie: 'Creează analogii creative și ușor de înțeles care să explice conceptele complexe prin comparații cu situații familiare elevilor. Formatează răspunsul în JSON cu structura: {"title": "...", "analogies": [{"concept": "...", "analogy": "...", "explanation": "..."}], "examples": [...]}',
    evaluare: 'Creează o evaluare cu întrebări variate (întrebări scurte, dezvoltare, probleme practice). Include baremul de notare. Formatează răspunsul în JSON cu structura: {"title": "...", "questions": [{"question": "...", "type": "...", "points": 10}], "answers": [...], "gradingRubric": "..."}'
  }

  return `${basePrompt}\n\n${specificInstructions[materialType as keyof typeof specificInstructions] || 'Generează materialul educațional solicitat.'}${additionalContext}\n\nRăspunde în limba română și asigură-te că conținutul este potrivit pentru nivelul specificat. IMPORTANT: Răspunde DOAR cu JSON-ul valid, fără text suplimentar înainte sau după.`
}
