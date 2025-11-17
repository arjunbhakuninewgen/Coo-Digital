import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Clock, Save, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TimeEntry {
  id: string;
  project_name: string;
  date: string;
  hours: number;
  notes: string | null;
}

const TimeTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [projects, setProjects] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [hours, setHours] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState<boolean>(false);

  // ------------------------------------------------------------
  // LOAD PROJECTS
  // ------------------------------------------------------------
  const loadProjects = async () => {
    const { data, error } = await supabase.from("projects").select("id, name");
    if (!error) setProjects(data || []);
  };

  // ------------------------------------------------------------
  // FETCH DAILY LOGS FOR SELECTED DATE
  // ------------------------------------------------------------
  const loadEntriesForDate = async () => {
    if (!user) return;

    const { data, error } = await supabase.functions.invoke("get-daily-summary", {
      body: {
        employee_id: user.id,
        date: format(selectedDate, "yyyy-MM-dd")
      }
    });

    if (error) {
      console.error(error);
      return;
    }

    setEntries(data.entries || []);
  };

  // ------------------------------------------------------------
  // ADD TIME ENTRY — Uses Edge Function
  // ------------------------------------------------------------
  const handleAddTimeEntry = async () => {
    if (!selectedProject || parseFloat(hours) <= 0) {
      toast({
        title: "Invalid Entry",
        description: "Select a project and enter valid hours.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase.functions.invoke("log-hours", {
      body: {
        employee_id: user.id,
        project_id: selectedProject,
        work_date: format(selectedDate, "yyyy-MM-dd"),
        hours: parseFloat(hours),
        notes: notes || null
      }
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Hours Logged", description: "Entry saved successfully." });

    setHours("0");
    setNotes("");
    setIsAddingEntry(false);

    loadEntriesForDate();
  };

  // ------------------------------------------------------------
  // LOAD WEEKLY + PROJECT BREAKDOWN
  // ------------------------------------------------------------
  const [weeklyReport, setWeeklyReport] = useState<any[]>([]);
  const [projectBreakdown, setProjectBreakdown] = useState<any[]>([]);

  const loadReports = async () => {
    if (!user) return;

    const weekly = await supabase.functions.invoke("get-weekly-report", {
      body: { employee_id: user.id }
    });

    const breakdown = await supabase.functions.invoke("get-project-breakdown", {
      body: { employee_id: user.id }
    });

    if (!weekly.error) setWeeklyReport(weekly.data || []);
    if (!breakdown.error) setProjectBreakdown(breakdown.data || []);
  };

  useEffect(() => {
    loadProjects();
    loadReports();
  }, [user]);

  useEffect(() => {
    loadEntriesForDate();
  }, [selectedDate, user]);

  const totalHoursForSelectedDate = entries.reduce((sum, e) => sum + e.hours, 0);

  return (
    <DashboardLayout title="Time Tracking">

      {/* ---------------------------------------------------------------- */}
      {/* LEFT: Calendar */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid gap-4 md:grid-cols-3">
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Pick a day to log or view hours</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border pointer-events-auto"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <p className="text-sm font-medium">Selected</p>
              <p className="text-sm text-muted-foreground">{format(selectedDate, "PPP")}</p>
            </div>
            {!isAddingEntry && (
              <Button onClick={() => setIsAddingEntry(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Hours
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* ---------------------------------------------------------------- */}
        {/* RIGHT: Add Entry or Entries */}
        {/* ---------------------------------------------------------------- */}
        <Card className="md:col-span-2">
          
          {isAddingEntry ? (
            <>
              <CardHeader>
                <CardTitle>Add Time Entry</CardTitle>
                <CardDescription>{format(selectedDate, "PPP")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">

                  {/* Project */}
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hours */}
                  <div className="space-y-2">
                    <Label>Hours</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe your work"
                    />
                  </div>

                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingEntry(false)}>Cancel</Button>
                <Button onClick={handleAddTimeEntry}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Entry
                </Button>
              </CardFooter>
            </>

          ) : (
            <>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Entries</CardTitle>
                    <CardDescription>{format(selectedDate, "PPP")}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {totalHoursForSelectedDate} Hours
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {entries.length > 0 ? (
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex justify-between p-3 border rounded-lg bg-card">
                        <div>
                          <h4 className="font-medium">{entry.project_name}</h4>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground">{entry.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{entry.hours} hours</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-xl font-medium mb-2">No Time Entries</h3>
                    <p className="text-muted-foreground">
                      Click “Add Hours” to log your work.
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* REPORTS SECTION */}
      {/* ---------------------------------------------------------------- */}
      <Tabs defaultValue="daily" className="mt-8">

        <TabsList>
          <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="projects">Projects Breakdown</TabsTrigger>
        </TabsList>

        {/* DAILY SUMMARY */}
        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Hours Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-muted-foreground">No entries for this day.</p>
              ) : (
                entries.map((e) => (
                  <p key={e.id}>
                    {e.project_name} — {e.hours} hours
                  </p>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEEKLY REPORT */}
        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Weekly Report</CardTitle></CardHeader>
            <CardContent>
              {weeklyReport.length === 0 ? (
                <p className="text-muted-foreground">No data</p>
              ) : (
                weeklyReport.map((w) => (
                  <p key={w.date}>{w.date} — {w.total_hours} hrs</p>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROJECT BREAKDOWN */}
        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Project Breakdown</CardTitle></CardHeader>
            <CardContent>
              {projectBreakdown.length === 0 ? (
                <p className="text-muted-foreground">No data</p>
              ) : (
                projectBreakdown.map((p) => (
                  <p key={p.project_name}>{p.project_name} — {p.total_hours} hrs</p>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </DashboardLayout>
  );
};

export default TimeTracking;
