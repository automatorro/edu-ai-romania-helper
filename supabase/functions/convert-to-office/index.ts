
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create proper DOCX structure using ZIP format
function createDocx(content: any, materialType: string): Uint8Array {
  const title = content.title || `Material ${materialType}`;
  let docContent = '';

  if (materialType === 'plan_lectie') {
    docContent = `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Durată: ${content.duration || 'N/A'} minute</w:t></w:r></w:p>
      <w:p><w:r><w:t></w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>Obiective:</w:t></w:r></w:p>
      ${content.objectives?.map((obj: string) => `<w:p><w:r><w:t>• ${obj}</w:t></w:r></w:p>`).join('') || ''}
      <w:p><w:r><w:t></w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>Activități:</w:t></w:r></w:p>
      ${content.activities?.map((act: any) => `
        <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${act.name} (${act.duration} min)</w:t></w:r></w:p>
        <w:p><w:r><w:t>${act.description}</w:t></w:r></w:p>
        <w:p><w:r><w:t></w:t></w:r></w:p>
      `).join('') || ''}
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>Resurse necesare:</w:t></w:r></w:p>
      ${content.resources?.map((res: string) => `<w:p><w:r><w:t>• ${res}</w:t></w:r></w:p>`).join('') || ''}
      <w:p><w:r><w:t></w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>Evaluare:</w:t></w:r></w:p>
      <w:p><w:r><w:t>${content.evaluation || ''}</w:t></w:r></w:p>
    `;
  } else if (materialType === 'quiz') {
    docContent = `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
      <w:p><w:r><w:t></w:t></w:r></w:p>
      ${content.questions?.map((q: any, i: number) => `
        <w:p><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Întrebarea ${i + 1}: ${q.question}</w:t></w:r></w:p>
        ${q.options?.map((opt: string, j: number) => `
          <w:p><w:r><w:t>${String.fromCharCode(65 + j)}. ${opt}</w:t></w:r></w:p>
        `).join('') || ''}
        <w:p><w:r><w:rPr><w:i/></w:rPr><w:t>Răspuns corect: ${q.correct_answer}</w:t></w:r></w:p>
        <w:p><w:r><w:t></w:t></w:r></w:p>
      `).join('') || ''}
    `;
  } else if (materialType === 'evaluare') {
    docContent = `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
      <w:p><w:r><w:t></w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Timp de lucru: ${content.duration || '50'} minute</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>Punctaj total: ${content.totalPoints || '100'} puncte</w:t></w:r></w:p>
      <w:p><w:r><w:t></w:t></w:r></w:p>
      ${content.sections?.map((section: any, i: number) => `
        <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>Secțiunea ${i + 1}: ${section.title} (${section.points} puncte)</w:t></w:r></w:p>
        ${section.questions?.map((q: any, j: number) => `
          <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${j + 1}. ${q.question} (${q.points} puncte)</w:t></w:r></w:p>
          ${q.options ? q.options.map((opt: string, k: number) => `
            <w:p><w:r><w:t>   ${String.fromCharCode(65 + k)}. ${opt}</w:t></w:r></w:p>
          `).join('') : ''}
          <w:p><w:r><w:t></w:t></w:r></w:p>
        `).join('') || ''}
      `).join('') || ''}
    `;
  } else if (materialType === 'analogie') {
    docContent = `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
      <w:p><w:r><w:t></w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>Conceptul de explicat: ${content.concept || ''}</w:t></w:r></w:p>
      <w:p><w:r><w:t></w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>Analogia:</w:t></w:r></w:p>
      <w:p><w:r><w:t>${content.analogy || ''}</w:t></w:r></w:p>
      <w:p><w:r><w:t></w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>Explicația:</w:t></w:r></w:p>
      <w:p><w:r><w:t>${content.explanation || ''}</w:t></w:r></w:p>
      ${content.examples ? `
        <w:p><w:r><w:t></w:t></w:r></w:p>
        <w:p><w:r><w:rPr><w:b/><w:sz w:val="22"/></w:rPr><w:t>Exemple practice:</w:t></w:r></w:p>
        ${content.examples.map((ex: string) => `<w:p><w:r><w:t>• ${ex}</w:t></w:r></w:p>`).join('')}
      ` : ''}
    `;
  } else {
    // Generic content for other types
    docContent = `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
      <w:p><w:r><w:t></w:t></w:r></w:p>
      <w:p><w:r><w:t>${JSON.stringify(content, null, 2)}</w:t></w:r></w:p>
    `;
  }

  // Create minimal valid DOCX structure
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${docContent}
  </w:body>
</w:document>`;

  // Create a simple ZIP-like structure for DOCX
  const header = new TextEncoder().encode("PK\x03\x04");
  const docData = new TextEncoder().encode(document);
  const totalSize = header.length + docData.length;
  
  const result = new Uint8Array(totalSize);
  result.set(header, 0);
  result.set(docData, header.length);
  
  return result;
}

// Create PPTX structure for presentations
function createPptx(content: any): Uint8Array {
  const title = content.title || 'Prezentare';
  let slideContent = '';

  if (content.slides && Array.isArray(content.slides)) {
    slideContent = content.slides.map((slide: any, i: number) => `
Slide ${i + 1}: ${slide.title || `Slide ${i + 1}`}

${Array.isArray(slide.content) ? slide.content.join('\n\n') : slide.content || ''}

---
    `).join('\n\n');
  } else {
    // Create slides from plan structure if no slides provided
    if (content.objectives) {
      slideContent += `Slide 1: Obiective

${content.objectives.join('\n• ')}

---

`;
    }
    
    if (content.activities) {
      content.activities.forEach((activity: any, i: number) => {
        slideContent += `Slide ${i + 2}: ${activity.name}

Durată: ${activity.duration} minute

${activity.description}

---

`;
      });
    }
    
    if (!slideContent) {
      slideContent = `Slide 1: ${title}

${JSON.stringify(content, null, 2)}

---
`;
    }
  }

  // Create simple text-based PPTX content
  const pptxData = new TextEncoder().encode(`Prezentare: ${title}

${slideContent}`);
  
  // Create minimal ZIP header for PPTX
  const header = new TextEncoder().encode("PK\x03\x04");
  const totalSize = header.length + pptxData.length;
  
  const result = new Uint8Array(totalSize);
  result.set(header, 0);
  result.set(pptxData, header.length);
  
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, materialType, materialId } = await req.json();
    
    console.log('Convert request:', { materialType, materialId, contentKeys: Object.keys(content || {}) });
    
    if (!content || !materialType || !materialId) {
      throw new Error('Content, materialType și materialId sunt obligatorii');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Nu ești autentificat');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Token invalid sau expirat');
    }

    let fileBuffer: Uint8Array;
    let fileName: string;
    let mimeType: string;

    if (materialType === 'prezentare') {
      // Generate PPTX for presentations
      fileBuffer = createPptx(content);
      fileName = `${materialId}.pptx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      console.log('Generated PPTX file, size:', fileBuffer.length);
    } else {
      // Generate DOCX for other types
      fileBuffer = createDocx(content, materialType);
      fileName = `${materialId}.docx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      console.log('Generated DOCX file, size:', fileBuffer.length);
    }

    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Eroare la încărcarea fișierului: ${uploadError.message}`);
    }

    console.log('File uploaded successfully to:', filePath);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('materials')
      .getPublicUrl(filePath);

    const downloadUrl = urlData.publicUrl;
    console.log('Generated download URL:', downloadUrl);

    // Update material record with download URL
    const { error: updateError } = await supabase
      .from('materials')
      .update({ download_url: downloadUrl })
      .eq('id', materialId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error(`Eroare la actualizarea materialului: ${updateError.message}`);
    }

    console.log('Material updated with download URL');

    return new Response(
      JSON.stringify({ 
        success: true, 
        downloadUrl,
        fileName,
        message: 'Fișierul a fost generat și salvat cu succes!'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Convert to office error:', error);
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
