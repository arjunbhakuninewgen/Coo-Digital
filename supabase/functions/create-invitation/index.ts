// supabase/functions/create-invitation/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { v4 } from "https://deno.land/std@0.190.0/uuid/mod.ts"; // Deno uuid

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FUNCTIONS_BASE = Deno.env.get("SUPABASE_FUNCTIONS_BASE") ?? `${SUPABASE_URL.replace('.supabase.co','')}.functions.supabase.co`;

interface CreateInvitationReq {
  employee_id: string;
  employeeEmail: string;
  employeeName?: string;
  invitedBy: string;
  companyName?: string;
  signupUrl: string;
  expiresInDays?: number; // default 7
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: CreateInvitationReq = await req.json();
    if (!body.employee_id || !body.employeeEmail || !body.invitedBy || !body.signupUrl) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    const token = v4.generate();
    const expiresDays = body.expiresInDays ?? 7;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString();

    // 1) Insert row
    const insertResp = await fetch(`${SUPABASE_URL}/rest/v1/employee_invitations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: crypto.randomUUID(),
        email: body.employeeEmail,
        employee_id: body.employee_id,
        invited_by: body.invitedBy,
        invited_at: new Date().toISOString(),
        expires_at: expiresAt,
        token: token
      }),
    });

    const insertData = await insertResp.json();
    if (!insertResp.ok) return new Response(JSON.stringify({ error: insertData }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});

    // 2) Call send-invitation function (deployed) to send email (it needs RESEND_API_KEY set in that function)
    const sendFnUrl = `${SUPABASE_URL.replace('.supabase.co','')}.functions.supabase.co/send-invitation`;
    // Use the functions domain: <project>.functions.supabase.co/send-invitation
    // If you set SUPABASE_FUNCTIONS_BASE env, use that instead

    const fullSendUrl = Deno.env.get("SUPABASE_FUNCTIONS_BASE") ?? `${SUPABASE_URL.split('.supabase.co')[0]}.functions.supabase.co/send-invitation`;

    // call function
    const sendResp = await fetch(fullSendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeName: body.employeeName ?? body.employeeEmail,
        employeeEmail: body.employeeEmail,
        invitedBy: body.invitedBy,
        companyName: body.companyName ?? "Your Company",
        signupUrl: `${body.signupUrl}?token=${token}`
      })
    });

    const sendData = await sendResp.json().catch(() => ({ ok: sendResp.ok }));
    if (!sendResp.ok) {
      // continue but return send error too
      return new Response(JSON.stringify({ invitation: insertData[0], emailSendError: sendData }), { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    return new Response(JSON.stringify({ invitation: insertData[0], emailResponse: sendData }), { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders }});
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
  }
});
