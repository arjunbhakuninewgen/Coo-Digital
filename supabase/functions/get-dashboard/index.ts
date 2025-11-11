// supabase/functions/get-dashboard/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // fetch employees (with profile join)
    const employeesResp = await fetch(`${SUPABASE_URL}/rest/v1/employees?select=*,profiles(*)`, {
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
      },
    });
    const employees = await employeesResp.json();

    // projects
    const projectsResp = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    const projects = await projectsResp.json();

    // skills
    const skillsResp = await fetch(`${SUPABASE_URL}/rest/v1/skills`, {
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    const skills = await skillsResp.json();

    // assignments
    const empProjectsResp = await fetch(`${SUPABASE_URL}/rest/v1/employee_projects`, {
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    const empProjects = await empProjectsResp.json();

    const empSkillsResp = await fetch(`${SUPABASE_URL}/rest/v1/employee_skills`, {
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    const empSkills = await empSkillsResp.json();

    return new Response(JSON.stringify({ employees, projects, skills, employee_projects: empProjects, employee_skills: empSkills }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }});
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
  }
});
