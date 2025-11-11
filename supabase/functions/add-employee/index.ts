// supabase/functions/add-employee/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AddEmployeeReq {
  email: string;
  password: string; // strong
  name: string;
  role?: 'admin'|'manager'|'teamlead'|'employee';
  department?: string; // must be one of enum values
  job_role?: string;
  joining_date?: string; // ISO date
  experience?: number;
  avatar?: string | null;
  ctc?: number | null;
  utilization?: number | null;
  phone?: string | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: AddEmployeeReq = await req.json();
    if (!body?.email || !body?.password || !body?.name) {
      return new Response(JSON.stringify({ error: "Missing required fields (email, password, name)" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    // 1) create auth user (Admin API)
    const createUserResp = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        email_confirm: true,
      }),
    });

    const createUserData = await createUserResp.json();
    if (!createUserResp.ok) {
      return new Response(JSON.stringify({ error: createUserData }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    const userId = createUserData.id;

    // 2) insert profile
    const profileResp = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: userId,
        email: body.email,
        name: body.name,
        phone: body.phone ?? null,
        role: body.role ?? "employee",
      }),
    });

    const profileData = await profileResp.json();
    if (!profileResp.ok) {
      return new Response(JSON.stringify({ error: profileData }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    // 3) insert employee (1:1 with same id)
    const employeeResp = await fetch(`${SUPABASE_URL}/rest/v1/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: userId,
        avatar: body.avatar ?? null,
        ctc: body.ctc ?? null,
        department: body.department ?? "Development",
        experience: body.experience ?? 0,
        job_role: body.job_role ?? "Employee",
        joining_date: body.joining_date ?? new Date().toISOString().slice(0,10),
        utilization: body.utilization ?? null,
      }),
    });

    const employeeData = await employeeResp.json();
    if (!employeeResp.ok) {
      return new Response(JSON.stringify({ error: employeeData }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    return new Response(JSON.stringify({ user: createUserData, profile: profileData[0], employee: employeeData[0] }), { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders }});
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
  }
});
