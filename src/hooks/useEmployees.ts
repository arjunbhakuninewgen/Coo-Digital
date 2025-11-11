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
  projects: { id: string; name: string }[];
}

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch employees with their profiles + assigned projects
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          department,
          job_role,
          experience,
          joining_date,
          ctc,
          utilization,
          skills,
          profiles ( name, email, phone, role ),
          employee_projects (
            projects ( id, name )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((emp: any) => ({
        id: emp.id,
        name: emp.profiles?.name ?? "N/A",
        email: emp.profiles?.email ?? "N/A",
        phone: emp.profiles?.phone ?? "",
        department: emp.department ?? "Development",
        role: emp.profiles?.role ?? emp.job_role ?? "Employee",
        joiningDate: emp.joining_date,
        experience: emp.experience ?? 0,
        skills: Array.isArray(emp.skills) ? emp.skills : [],
        ctc: emp.ctc ?? 0,
        utilization: emp.utilization ?? 0,
        avatar: emp.profiles?.name?.charAt(0)?.toUpperCase() ?? "E",
        projects:
          emp.employee_projects?.map((p: any) => ({
            id: p.projects?.id,
            name: p.projects?.name,
          })) || [],
      }));

      setEmployees(formatted);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add employee using edge function
  const addEmployee = async (data: any) => {
    try {
      const { data: res, error } = await supabase.functions.invoke("add-employee", {
        body: data,
      });
      if (error) throw error;
      await fetchEmployees();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // ✅ Edit employee details
  const editEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      const { error } = await supabase.from("employees").update(updates).eq("id", id);
      if (error) throw error;
      await fetchEmployees();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return { employees, loading, error, addEmployee, editEmployee, refetch: fetchEmployees };
};
