import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { X, Mail, Phone, Briefcase, Calendar, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const EmployeeProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch user's skills
  const fetchUserSkills = async () => {
    if (!user) {
      console.warn("⏳ Waiting for user before fetching skills...");
      return;
    }
    console.log("🔍 Fetching skills for user:", user.id);
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("employee_skills")
        .select("skills(name)")
        .eq("employee_id", user.id);

      if (error) throw error;

      const skillNames = data?.map((d: any) => d.skills?.name).filter(Boolean) || [];
      console.log("✅ Loaded skills:", skillNames);
      setSkills(skillNames);
    } catch (err: any) {
      console.error("❌ Error fetching skills:", err);
      toast({
        title: "Error fetching skills",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Wait for `user` before fetching skills
  useEffect(() => {
    if (user) fetchUserSkills();
  }, [user]);

  // ✅ Add skill
  const handleAddSkill = async () => {
    console.log("🟢 Add skill clicked");
    if (!newSkill.trim()) {
      toast({ title: "Missing skill", description: "Please enter a skill name." });
      return;
    }
    if (!user) {
      toast({ title: "Not ready yet", description: "User not loaded. Please wait a moment." });
      console.warn("⛔ Skipping — user not ready");
      return;
    }

    const trimmed = newSkill.trim();
    console.log("📦 Adding skill:", trimmed);
    try {
      // Step 1: Check if skill exists
      const { data: skillData, error: skillError } = await supabase
        .from("skills")
        .select("id")
        .eq("name", trimmed)
        .maybeSingle();

      if (skillError) throw skillError;
      let skillId = skillData?.id;

      // Step 2: Create skill if not found
      if (!skillId) {
        console.log("🆕 Creating new skill:", trimmed);
        const { data: newSkillData, error: createError } = await supabase
          .from("skills")
          .insert([{ name: trimmed }])
          .select()
          .single();
        if (createError) throw createError;
        skillId = newSkillData.id;
      }

      // Step 3: Assign skill
      console.log("🔗 Assigning skill", { employee_id: user.id, skill_id: skillId });
      const { error: assignError } = await supabase.functions.invoke("assign-skill", {
        body: { employee_id: user.id, skill_id: skillId, proficiency_level: null },
      });

      if (assignError) throw assignError;

      // Step 4: Update UI
      setSkills((prev) => [...prev, trimmed]);
      setNewSkill("");
      toast({ title: "Skill added", description: `${trimmed} added successfully.` });
      console.log("✅ Skill added successfully");
    } catch (err: any) {
      console.error("❌ Add skill error:", err);
      toast({ title: "Error adding skill", description: err.message, variant: "destructive" });
    }
  };

  // ✅ Remove skill
  const handleRemoveSkill = async (skill: string) => {
    if (!user) return;
    console.log("🗑 Removing skill:", skill);
    try {
      const { data: skillData, error: skillError } = await supabase
        .from("skills")
        .select("id")
        .eq("name", skill)
        .maybeSingle();
      if (skillError) throw skillError;
      if (!skillData?.id) throw new Error("Skill not found");

      const { error: deleteError } = await supabase
        .from("employee_skills")
        .delete()
        .eq("employee_id", user.id)
        .eq("skill_id", skillData.id);
      if (deleteError) throw deleteError;

      setSkills((prev) => prev.filter((s) => s !== skill));
      toast({ title: "Skill removed", description: `${skill} removed.` });
    } catch (err: any) {
      console.error("❌ Error removing skill:", err);
      toast({ title: "Error removing skill", description: err.message, variant: "destructive" });
    }
  };

  // ✅ Save skills (no-op but toggles edit mode)
  const handleSaveSkills = () => {
    setIsEditingSkills(false);
    toast({
      title: "Skills Updated",
      description: "All changes have been saved successfully.",
    });
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Section */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-3xl">
                  {user?.name?.charAt(0)?.toUpperCase() || "E"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.name || "Employee"}</CardTitle>
            <CardDescription className="capitalize">{user?.role || "Staff"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user?.email || "N/A"}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
            {user?.department && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{user.department}</span>
              </div>
            )}
            {user?.joiningDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {format(new Date(user.joiningDate), "PPP")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Skills</CardTitle>
              {!isEditingSkills ? (
                <Button
                  onClick={() => setIsEditingSkills(true)}
                  disabled={loading || !user}
                  type="button"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Edit Skills
                </Button>
              ) : (
                <Button
                  onClick={handleSaveSkills}
                  variant="outline"
                  disabled={saving}
                  type="button"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              )}
            </div>
            <CardDescription>Manage your professional skills</CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6 text-muted-foreground">
                Loading skills...
              </div>
            ) : isEditingSkills ? (
              <>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Add new skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    disabled={!newSkill.trim() || !user}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="pl-3 pr-2 py-1.5">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 hover:bg-muted rounded-full"
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <Badge key={i} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {skills.length === 0 && (
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
