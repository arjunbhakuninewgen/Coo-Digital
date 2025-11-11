// supabase/functions/assign-skill/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AssignSkillReq {
  employee_id: string;
  skill_id: string;
  proficiency_level?: number | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body: AssignSkillReq = await req.json();
    if (!body.employee_id || !body.skill_id) {
      return new Response(JSON.stringify({ error: "Missing employee_id or skill_id" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/employee_skills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        employee_id: body.employee_id,
        skill_id: body.skill_id,
        proficiency_level: body.proficiency_level ?? null,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) return new Response(JSON.stringify({ error: data }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});

    return new Response(JSON.stringify({ employee_skill: data[0] }), { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders }});
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
  }
});
