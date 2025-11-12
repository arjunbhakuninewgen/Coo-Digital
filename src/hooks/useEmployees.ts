// hooks/useEmployees.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: "Maintenance" | "Development" | "Social" | "Performance";
  role: string;
  joiningDate: string;
  experience: number;
  skills: string[];
  ctc: number;
  utilization: number;
  avatar?: string;
  projects: { id: string; name: string }[]; // now an array of project objects
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      // Select employees and join profile + employee_projects -> projects
      // This assumes:
      // - profiles table is related via employees.id -> profiles.id
      // - employee_projects has project_id foreign key to projects
      // Supabase PostgREST allows relationship selects like:
      // employee_projects(projects(id,name))
      const { data, error } = await supabase
        .from("employees")
        .select(
          `
          *,
          profiles:profiles!inner(id, name, email, phone, role),
          employee_projects:employee_projects (
            id,
            project_id,
            role_in_project,
            projects:projects ( id, name )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((emp: any) => {
        // map employee_projects -> projects array
        const projects =
          (emp.employee_projects || [])
            .map((ep: any) => ep?.projects)
            .filter(Boolean)
            .map((p: any) => ({ id: String(p.id), name: String(p.name) })) || [];

        // fallback name/email coming from joined profile record
        const profile = emp.profiles ?? emp.profile ?? null;

        return {
          id: emp.id,
          name: profile?.name ?? emp.job_role ?? "N/A",
          email: profile?.email ?? "N/A",
          phone: profile?.phone ?? emp.phone ?? "",
          department: (emp.department as Employee["department"]) ?? "Development",
          role: profile?.role ?? emp.job_role ?? "employee",
          joiningDate: emp.joining_date ?? emp.created_at ?? new Date().toISOString(),
          experience: emp.experience ?? 0,
          skills: Array.isArray(emp.skills) ? emp.skills : (typeof emp.skills === "string" ? emp.skills.split(",").map((s:string)=>s.trim()).filter(Boolean) : []),
          ctc: emp.ctc ?? 0,
          utilization: emp.utilization ?? 0,
          avatar: emp.avatar ?? (profile?.name ? profile.name.charAt(0).toUpperCase() : "E"),
          projects,
        } as Employee;
      });

      setEmployees(formatted);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load employees");
      console.error("fetchEmployees error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (data: any) => {
    try {
      // Call your edge function which creates profile + employee row and returns representation
      const { data: res, error } = await supabase.functions.invoke("add-employee", {
        body: data,
      });
      if (error) throw error;
      // refetch list
      await fetchEmployees();
      return { success: true, data: res };
    } catch (err: any) {
      console.error("addEmployee error:", err);
      return { success: false, error: err?.message ?? String(err) };
    }
  };

  const editEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      // Split updates between profiles and employees if needed
      const profileUpdates: any = {};
      const employeeUpdates: any = {};

      if (updates.name || updates.email || updates.phone || updates.role) {
        if (updates.name) profileUpdates.name = updates.name;
        if (updates.email) profileUpdates.email = updates.email;
        if (updates.phone) profileUpdates.phone = updates.phone;
        if (updates.role) profileUpdates.role = updates.role;
      }

      if (typeof updates.department !== "undefined") employeeUpdates.department = updates.department;
      if (typeof updates.joiningDate !== "undefined") employeeUpdates.joining_date = updates.joiningDate;
      if (typeof updates.experience !== "undefined") employeeUpdates.experience = updates.experience;
      if (typeof updates.skills !== "undefined") employeeUpdates.skills = updates.skills;
      if (typeof updates.ctc !== "undefined") employeeUpdates.ctc = updates.ctc;
      if (typeof updates.utilization !== "undefined") employeeUpdates.utilization = updates.utilization;
      if (typeof updates.avatar !== "undefined") employeeUpdates.avatar = updates.avatar;
      if (typeof updates.role !== "undefined") {
        // role might be stored in profiles
        profileUpdates.role = updates.role;
      }

      // Update profiles (profile id is same as employee id per your schema)
      if (Object.keys(profileUpdates).length > 0) {
        const { error: pErr } = await supabase
          .from("profiles")
          .update(profileUpdates)
          .eq("id", id);
        if (pErr) throw pErr;
      }

      if (Object.keys(employeeUpdates).length > 0) {
        const { error: eErr } = await supabase
          .from("employees")
          .update(employeeUpdates)
          .eq("id", id);
        if (eErr) throw eErr;
      }

      await fetchEmployees();
      return { success: true };
    } catch (err: any) {
      console.error("editEmployee error:", err);
      return { success: false, error: err?.message ?? String(err) };
    }
  };

  useEffect(() => {
    fetchEmployees();
    // Optionally subscribe to realtime updates here in future
  }, []);

  return { employees, loading, error, addEmployee, editEmployee, fetchEmployees };
};
