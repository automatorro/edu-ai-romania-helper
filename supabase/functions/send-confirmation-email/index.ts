
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  name: string;
  confirmationUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, confirmationUrl }: ConfirmationEmailRequest = await req.json();

    console.log('Sending confirmation email to:', email);

    const emailResponse = await resend.emails.send({
      from: "EduAI <onboarding@resend.dev>",
      to: [email],
      subject: "Confirmă-ți contul EduAI",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { 
              display: inline-block; 
              background: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Bine ai venit la EduAI!</h1>
            </div>
            <div class="content">
              <h2>Salut ${name}!</h2>
              <p>Mulțumim că te-ai înregistrat la EduAI! Pentru a-ți finaliza contul, te rugăm să îți confirmi adresa de email.</p>
              
              <p>Apasă pe butonul de mai jos pentru a-ți confirma contul:</p>
              
              <a href="${confirmationUrl}" class="button">Confirmă contul</a>
              
              <p>Sau copiază și lipește acest link în browser:</p>
              <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px;">${confirmationUrl}</p>
              
              <p>Dacă nu te-ai înregistrat tu la EduAI, poți ignora acest email.</p>
              
              <p>Cu drag,<br>Echipa EduAI</p>
            </div>
            <div class="footer">
              <p>© 2025 EduAI. Toate drepturile rezervate.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send confirmation email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
