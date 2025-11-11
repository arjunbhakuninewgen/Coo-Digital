
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { X, User, Calendar, Briefcase, Mail, Phone, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { format } from "date-fns";

const EmployeeProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
// Fetch user's skills from static demo data
const fetchUserSkills = async () => {
  if (!user) {
    setLoading(false);
    return;
  }
  
  try {
    setLoading(true);
    // Initialize with some example skills for demo mode
    const userSkills = ["React", "TypeScript", "UI Design"];
    setSkills(userSkills);
  } catch (error) {
    console.error('Error in fetchUserSkills:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUserSkills();
  }, [user]);

// Handle adding a new skill (demo mode - local state only)
const handleAddSkill = async () => {
  if (!newSkill.trim()) return;
  const trimmed = newSkill.trim();
  if (skills.includes(trimmed)) {
    toast({
      title: "Skill already exists",
      description: `${trimmed} is already in your skills.`,
      variant: "destructive",
    });
    return;
  }

  setSkills([...skills, trimmed]);
  setNewSkill("");
  
  toast({
    title: "Skill added",
    description: `${trimmed} has been added to your skills.`,
  });
};
  
// Handle removing a skill (demo mode - local state only)
const handleRemoveSkill = async (skillToRemove: string) => {
  setSkills(skills.filter(skill => skill !== skillToRemove));
  
  toast({
    title: "Skill removed",
    description: `${skillToRemove} has been removed from your skills.`,
  });
};
  
  // Handle saving updated skills
  const handleSaveSkills = async () => {
    setSaving(true);
    try {
      // Just show success since individual operations were already saved
      toast({
        title: "Skills Updated",
        description: "Your skills have been updated successfully.",
      });
      setIsEditingSkills(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <DashboardLayout title="My Profile">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-3xl">{user?.name?.charAt(0) || "E"}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.name || "Employee"}</CardTitle>
            <CardDescription className="capitalize">{user?.role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user?.email}</span>
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
                <span>{user.department} Department</span>
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
        
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Skills</CardTitle>
              {!isEditingSkills ? (
                <Button onClick={() => setIsEditingSkills(true)} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Edit Skills
                </Button>
              ) : (
                <Button onClick={handleSaveSkills} variant="outline" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              )}
            </div>
            <CardDescription>
              Manage your professional skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading skills...</span>
                </div>
              </div>
            ) : isEditingSkills ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input 
                      placeholder="Add a new skill (e.g., React, UI Design)" 
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                  </div>
                  <Button onClick={handleAddSkill}>Add</Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1.5">
                      {skill}
                      <button 
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 hover:bg-muted rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-muted-foreground text-sm">No skills added yet. Add some skills to showcase your expertise.</p>
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground mt-4">
                  <p>Adding relevant skills helps our project managers assign you to appropriate projects.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                  {skills.length === 0 && (
                    <p className="text-muted-foreground">No skills added yet.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeProfile;
