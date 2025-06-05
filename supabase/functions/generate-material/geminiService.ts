
import { createPrompt } from './promptGenerator.ts';

export async function generateContentWithGemini(
  materialType: string,
  subject: string,
  gradeLevel: string,
  difficulty: string,
  additionalInfo?: string
): Promise<string> {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY not found in environment');
    throw new Error('Configurarea serverului este incompletă - cheia API lipsește');
  }

  console.log('Gemini API key found, generating content...');

  const prompt = createPrompt(materialType, subject, gradeLevel, difficulty, additionalInfo);
  console.log('Generated prompt:', prompt.substring(0, 200) + '...');
  
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
  console.log('Making request to Gemini API with model gemini-1.5-flash...');
  
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
  });

  console.log('Gemini API response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error response:', errorText);
    throw new Error(`Eroare API Gemini: ${response.status} - ${errorText}`);
  }

  const aiResponse = await response.json();
  console.log('Gemini API response received:', !!aiResponse.candidates);
  
  const generatedContent = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedContent) {
    console.error('No content generated:', aiResponse);
    throw new Error('Nu s-a putut genera conținutul - răspuns gol de la AI');
  }

  console.log('Content generated successfully, length:', generatedContent.length);
  return generatedContent;
}
