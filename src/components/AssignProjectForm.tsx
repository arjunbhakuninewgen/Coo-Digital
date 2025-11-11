import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const AssignProjectForm = ({ employeeId }: { employeeId: string }) => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      const { data, error } = await supabase.from("projects").select("id, name");
      if (error) toast({ title: "Error loading projects", description: error.message, variant: "destructive" });
      else setProjects(data || []);
    };
    loadProjects();
  }, []);

  const handleAssign = async () => {
    if (!selectedProject) return;

    const { error } = await supabase.functions.invoke("assign-project", {
      body: {
        employee_id: employeeId,
        project_id: selectedProject,
        role_in_project: role || null,
      },
    });

    if (error) {
      toast({ title: "Error assigning project", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Project Assigned", description: "Project successfully assigned." });
    }
  };

  return (
    <div className="space-y-4">
      <Select value={selectedProject} onValueChange={setSelectedProject}>
        <SelectTrigger>
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input placeholder="Role in project (optional)" value={role} onChange={(e) => setRole(e.target.value)} />

      <Button className="w-full" onClick={handleAssign}>
        Assign Project
      </Button>
    </div>
  );
};
