import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PlaybookEmailRequest {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: PlaybookEmailRequest = await req.json();

    console.log(`Sending playbook email to ${email} for ${name}`);

    // Get playbook URL from storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the playbook file URL (assumes file is named "playbook.pdf" in the playbooks bucket)
    const { data: files } = await supabase.storage.from("playbooks").list();
    
    let playbookUrl = "";
    if (files && files.length > 0) {
      const { data: urlData } = supabase.storage
        .from("playbooks")
        .getPublicUrl(files[0].name);
      playbookUrl = urlData.publicUrl;
    }

    const emailResponse = await resend.emails.send({
      from: "Sirah Digital <onboarding@resend.dev>",
      to: [email],
      subject: "Your AI Playbook for 2026 is Ready!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a2744; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #1a2744; margin-bottom: 10px; }
            .content { background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 30px; }
            .cta-button { display: inline-block; background: #daa520; color: #1a2744; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome, ${name}!</h1>
            </div>
            <div class="content">
              <p>Thank you for downloading the <strong>Practical AI Playbook for Business Owners Scaling in 2026</strong>.</p>
              <p>This 60-page guide will help you:</p>
              <ul>
                <li>Implement AI systems without hiring more staff</li>
                <li>Scale from ₹5-15 Lakhs to ₹50+ Lakhs per month</li>
                <li>Build sustainable, stress-free growth</li>
              </ul>
              ${playbookUrl ? `
              <p style="text-align: center;">
                <a href="${playbookUrl}" class="cta-button">📥 Download Your Playbook</a>
              </p>
              ` : `
              <p><em>Your playbook will be available soon. We'll send you another email when it's ready!</em></p>
              `}
            </div>
            <div class="footer">
              <p>Questions? Reply to this email - we're here to help!</p>
              <p>Best regards,<br>The Sirah Digital Team</p>
              <p><a href="https://sirahdigital.in/">sirahdigital.in</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update lead as playbook sent
    await supabase
      .from("leads")
      .update({ playbook_sent: true })
      .eq("email", email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-playbook-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);