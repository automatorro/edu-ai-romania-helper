
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateMaterialRequest {
  materialType: 'quiz' | 'plan_lectie' | 'prezentare' | 'analogie' | 'evaluare';
  subject: string;
  gradeLevel: string;
  difficulty: string;
  additionalInfo?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create a Supabase client with the Auth header
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the user from the auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { materialType, subject, gradeLevel, difficulty, additionalInfo } = await req.json() as GenerateMaterialRequest

    // Get Gemini API key from secrets
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    // Generate prompt based on material type
    const prompts = {
      quiz: `Creează un quiz pentru ${subject}, clasa ${gradeLevel}, nivel ${difficulty}. 
             Includeți 10 întrebări cu opțiuni multiple (4 variante fiecare), răspunsurile corecte și explicații.
             Format: JSON cu următoarea structură:
             {
               "title": "Titlul quiz-ului",
               "questions": [
                 {
                   "question": "Întrebarea",
                   "options": ["A", "B", "C", "D"],
                   "correct": 0,
                   "explanation": "Explicația răspunsului corect"
                 }
               ]
             }`,
      
      plan_lectie: `Creează un plan de lecție detaliat pentru ${subject}, clasa ${gradeLevel}, nivel ${difficulty}.
                   Format: JSON cu următoarea structură:
                   {
                     "title": "Titlul lecției",
                     "duration": "Durata în minute",
                     "objectives": ["Obiectiv 1", "Obiectiv 2"],
                     "materials": ["Material 1", "Material 2"],
                     "activities": [
                       {
                         "name": "Numele activității",
                         "duration": "10 min",
                         "description": "Descrierea detaliată"
                       }
                     ],
                     "evaluation": "Modul de evaluare"
                   }`,
      
      prezentare: `Creează o prezentare pentru ${subject}, clasa ${gradeLevel}, nivel ${difficulty}.
                  Format: JSON cu următoarea structură:
                  {
                    "title": "Titlul prezentării",
                    "slides": [
                      {
                        "title": "Titlul slide-ului",
                        "content": "Conținutul slide-ului",
                        "notes": "Note pentru profesor"
                      }
                    ]
                  }`,
      
      analogie: `Creează analogii creative pentru a explica concepte din ${subject}, clasa ${gradeLevel}, nivel ${difficulty}.
                Format: JSON cu următoarea structură:
                {
                  "title": "Analogii pentru ${subject}",
                  "analogies": [
                    {
                      "concept": "Conceptul de explicat",
                      "analogy": "Analogia creativă",
                      "explanation": "Explicația conexiunii"
                    }
                  ]
                }`,
      
      evaluare: `Creează o evaluare finală pentru ${subject}, clasa ${gradeLevel}, nivel ${difficulty}.
                Format: JSON cu următoarea structură:
                {
                  "title": "Evaluare finală ${subject}",
                  "instructions": "Instrucțiunile pentru elevi",
                  "questions": [
                    {
                      "type": "multiple_choice|open_ended|true_false",
                      "question": "Întrebarea",
                      "options": ["A", "B", "C", "D"] // doar pentru multiple choice
                      "points": 5,
                      "answer": "Răspunsul corect sau indicații"
                    }
                  ],
                  "total_points": 100
                }`
    }

    const prompt = prompts[materialType] + (additionalInfo ? `\n\nInformații suplimentare: ${additionalInfo}` : '')

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
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
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const geminiData = await response.json()
    const generatedText = geminiData.candidates[0].content.parts[0].text

    // Try to parse as JSON, fallback to text if it fails
    let content
    try {
      content = JSON.parse(generatedText)
    } catch {
      content = { text: generatedText }
    }

    // Check user's material limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('materials_count, materials_limit, subscription')
      .eq('id', user.id)
      .single()

    if (profile && profile.materials_count >= profile.materials_limit && profile.subscription === 'gratuit') {
      throw new Error('Ai atins limita de materiale pentru contul gratuit. Upgrade la Premium pentru materiale nelimitate!')
    }

    // Save the generated material
    const { data: material, error: materialError } = await supabase
      .from('materials')
      .insert({
        user_id: user.id,
        title: content.title || `${materialType} - ${subject}`,
        content: content,
        material_type: materialType,
        subject: subject,
        grade_level: gradeLevel,
        difficulty: difficulty
      })
      .select()
      .single()

    if (materialError) {
      throw materialError
    }

    return new Response(
      JSON.stringify({ success: true, material }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in generate-material function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
