
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  employeeName: string;
  employeeEmail: string;
  invitedBy: string;
  companyName?: string;
  signupUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing invitation request...");
    
    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("RESEND_API_KEY available:", !!resendApiKey);
    console.log("RESEND_API_KEY length:", resendApiKey?.length || 0);
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured. Please contact administrator." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { employeeName, employeeEmail, invitedBy, companyName = "Your Agency", signupUrl }: InvitationRequest = await req.json();

    console.log("Sending invitation to:", employeeEmail);
    console.log("Invited by:", invitedBy);

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "HR Team <onboarding@resend.dev>",
      to: [employeeEmail],
      subject: `Welcome to ${companyName} - Complete Your Account Setup`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to ${companyName}!</h1>
          
          <p>Hello ${employeeName},</p>
          
          <p>We're excited to have you join our team! Your employee account has been created by ${invitedBy}.</p>
          
          <p>To complete your account setup and access your employee dashboard, please:</p>
          
          <ol>
            <li>Click the button below to visit our login page</li>
            <li>Click "Don't have an account? Sign up"</li>
            <li>Use your email address: <strong>${employeeEmail}</strong></li>
            <li>Create a secure password</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signupUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Account Setup
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${signupUrl}">${signupUrl}</a>
          </p>
          
          <p>If you have any questions, please don't hesitate to reach out to your manager or HR team.</p>
          
          <p>Best regards,<br>
          The ${companyName} Team</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            This invitation is valid for 7 days. If you didn't expect this email, please contact your HR department.
          </p>
        </div>
      `,
    });

    console.log("Invitation sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send invitation" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
