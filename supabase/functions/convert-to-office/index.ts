
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple DOCX generator using XML templates
function generateDocx(content: any, materialType: string): Uint8Array {
  const title = content.title || `Material ${materialType}`;
  let docContent = '';

  if (materialType === 'plan_lectie') {
    docContent = `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Durata: ${content.duration || 'N/A'} minute</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Obiective:</w:t></w:r></w:p>
      ${content.objectives?.map((obj: string) => `<w:p><w:r><w:t>• ${obj}</w:t></w:r></w:p>`).join('') || ''}
      <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Activități:</w:t></w:r></w:p>
      ${content.activities?.map((act: any) => `
        <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${act.name} (${act.duration} min)</w:t></w:r></w:p>
        <w:p><w:r><w:t>${act.description}</w:t></w:r></w:p>
      `).join('') || ''}
      <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Resurse:</w:t></w:r></w:p>
      ${content.resources?.map((res: string) => `<w:p><w:r><w:t>• ${res}</w:t></w:r></w:p>`).join('') || ''}
      <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Evaluare:</w:t></w:r></w:p>
      <w:p><w:r><w:t>${content.evaluation || ''}</w:t></w:r></w:p>
    `;
  } else if (materialType === 'quiz') {
    docContent = `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
      ${content.questions?.map((q: any, i: number) => `
        <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Întrebarea ${i + 1}: ${q.question}</w:t></w:r></w:p>
        ${q.options?.map((opt: string, j: number) => `
          <w:p><w:r><w:t>${String.fromCharCode(65 + j)}. ${opt}</w:t></w:r></w:p>
        `).join('') || ''}
        <w:p><w:r><w:rPr><w:i/></w:rPr><w:t>Răspuns corect: ${q.correct_answer}</w:t></w:r></w:p>
        <w:p></w:p>
      `).join('') || ''}
    `;
  } else {
    // Generic content for other types
    docContent = `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>${title}</w:t></w:r></w:p>
      <w:p><w:r><w:t>${JSON.stringify(content, null, 2)}</w:t></w:r></w:p>
    `;
  }

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${docContent}
  </w:body>
</w:document>`;

  return new TextEncoder().encode(docXml);
}

// Simple PPTX generator for presentations
function generatePptx(content: any): Uint8Array {
  const title = content.title || 'Prezentare';
  let slideContent = '';

  if (content.slides) {
    slideContent = content.slides.map((slide: any, i: number) => `
      <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld>
          <p:spTree>
            <p:sp>
              <p:txBody>
                <a:p>
                  <a:r>
                    <a:t>${slide.title || `Slide ${i + 1}`}</a:t>
                  </a:r>
                </a:p>
                ${slide.content?.map((item: string) => `
                  <a:p>
                    <a:r>
                      <a:t>${item}</a:t>
                    </a:r>
                  </a:p>
                `).join('') || ''}
              </p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
      </p:sld>
    `).join('');
  } else {
    slideContent = `
      <p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:cSld>
          <p:spTree>
            <p:sp>
              <p:txBody>
                <a:p>
                  <a:r>
                    <a:t>${title}</a:t>
                  </a:r>
                </a:p>
                <a:p>
                  <a:r>
                    <a:t>${JSON.stringify(content, null, 2)}</a:t>
                  </a:r>
                </a:p>
              </p:txBody>
            </p:sp>
          </p:spTree>
        </p:cSld>
      </p:sld>
    `;
  }

  const pptXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    <p:sldId id="256"/>
  </p:sldIdLst>
  ${slideContent}
</p:presentation>`;

  return new TextEncoder().encode(pptXml);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, materialType, materialId } = await req.json();
    
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
      fileBuffer = generatePptx(content);
      fileName = `${materialId}.pptx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else {
      // Generate DOCX for other types
      fileBuffer = generateDocx(content, materialType);
      fileName = `${materialId}.docx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
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
      throw new Error('Eroare la încărcarea fișierului');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('materials')
      .getPublicUrl(filePath);

    const downloadUrl = urlData.publicUrl;

    // Update material record with download URL
    const { error: updateError } = await supabase
      .from('materials')
      .update({ download_url: downloadUrl })
      .eq('id', materialId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Eroare la actualizarea materialului');
    }

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
