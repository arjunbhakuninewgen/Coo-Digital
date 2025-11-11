import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Briefcase, Calendar, X, Loader2, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const EmployeeProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSkills = async () => {
  if (!user) return;
  setLoading(true);

  const { data, error } = await supabase
    .from("employee_skills")
    .select("skills(name)")
    .eq("employee_id", user.id);

  if (error) {
    toast({
      title: "Error fetching skills",
      description: error.message,
      variant: "destructive",
    });
  } else {
    setSkills(data.map((s: any) => s.skills.name));
  }
  setLoading(false);
};

  useEffect(() => {
    fetchSkills();
  }, [user]);

  const handleAddSkill = async () => {
  if (!newSkill.trim() || !user) return;
  const skillName = newSkill.trim();

  try {
    setSaving(true);

    // 1️⃣ Find or create skill
    let { data: existingSkill } = await supabase
      .from("skills")
      .select("id")
      .eq("name", skillName)
      .single();

    if (!existingSkill) {
      const { data: newSkillRow, error: skillInsertError } = await supabase
        .from("skills")
        .insert([{ name: skillName }])
        .select()
        .single();

      if (skillInsertError) throw skillInsertError;
      existingSkill = newSkillRow;
    }

    // 2️⃣ Link in employee_skills
    const { error: linkError } = await supabase
      .from("employee_skills")
      .insert([{ employee_id: user.id, skill_id: existingSkill.id }]);

    if (linkError) throw linkError;

    setSkills([...skills, skillName]);
    setNewSkill("");
    toast({ title: "✅ Skill added", description: `${skillName} linked successfully.` });
  } catch (err: any) {
    toast({ title: "Error adding skill", description: err.message, variant: "destructive" });
  } finally {
    setSaving(false);
  }
};


 const handleRemoveSkill = async (skill: string) => {
  if (!user) return;

  const { error } = await (supabase as any)
    .from("employee_skills")
    .delete()
    .eq("employee_id", user.id)
    .eq("skill_name", skill);

  if (error) {
    toast({
      title: "Error removing skill",
      description: error.message,
      variant: "destructive",
    });
  } else {
    setSkills(skills.filter((s) => s !== skill));
    toast({ title: "Removed", description: `${skill} removed.` });
  }
};

  return (
    <DashboardLayout title="My Profile">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarFallback>{user?.name?.[0] ?? "E"}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-2">{user?.name}</CardTitle>
            <CardDescription>{user?.role ?? "Employee"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {user?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" /> {user.email}
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" /> {user.phone}
              </div>
            )}
            {user?.department && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" /> {user.department}
              </div>
            )}
            {user?.joiningDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Joined {format(new Date(user.joiningDate), "PPP")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex justify-between items-center">
            <div>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Manage your skills below.</CardDescription>
            </div>
            <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
              {isEditing ? "Done" : "Edit Skills"}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : isEditing ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  />
                  <Button onClick={handleAddSkill} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="pl-3 pr-2 py-1">
                      {skill}
                      <button onClick={() => handleRemoveSkill(skill)}>
                        <X className="ml-1 h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No skills added yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeProfile;
