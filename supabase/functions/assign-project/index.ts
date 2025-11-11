// supabase/functions/assign-project/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AssignProjectReq {
  employee_id: string;
  project_id: string;
  role_in_project?: string | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body: AssignProjectReq = await req.json();
    if (!body.employee_id || !body.project_id) {
      return new Response(JSON.stringify({ error: "Missing employee_id or project_id" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/employee_projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        employee_id: body.employee_id,
        project_id: body.project_id,
        role_in_project: body.role_in_project ?? null,
        assigned_at: new Date().toISOString()
      }),
    });

    const data = await resp.json();
    if (!resp.ok) return new Response(JSON.stringify({ error: data }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});

    return new Response(JSON.stringify({ employee_project: data[0] }), { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders }});
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
  }
});
