// supabase/functions/create-project/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface CreateProjectReq {
  name: string;
  description?: string;
  start_date?: string; // ISO
  end_date?: string;
  status?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: CreateProjectReq = await req.json();

    if (!body?.name) {
      return new Response(JSON.stringify({ error: "Missing project name" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    const resp = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: body.name,
        description: body.description ?? null,
        start_date: body.start_date ?? null,
        end_date: body.end_date ?? null,
        status: body.status ?? null,
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
    }

    return new Response(JSON.stringify({ project: data[0] }), { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders }});
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }});
  }
});
