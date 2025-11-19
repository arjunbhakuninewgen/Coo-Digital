import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { format } from "date-fns";
import { Clock, Save, Plus } from "lucide-react";

import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------
interface TimeEntry {
  id: string;
  project_name: string;
  date: string;
  hours: number;
  notes: string | null;
}

const COLORS = [
  "#4F46E5",
  "#0EA5E9",
  "#22C55E",
  "#F97316",
  "#E11D48",
  "#A855F7",
  "#14B8A6",
];

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
    const { data, error } = await supabase
      .from("projects")
      .select("id, name");

    if (!error) setProjects(data || []);
  };

  // ------------------------------------------------------------
  // FETCH DAILY ENTRIES
  // ------------------------------------------------------------
  const loadEntriesForDate = async () => {
    if (!user) return;

    const { data, error } = await supabase.functions.invoke(
      "get-daily-entries",
      {
        body: {
          employee_id: user.id,
          date: format(selectedDate, "yyyy-MM-dd"),
        },
      }
    );

    if (!error) setEntries(data.data || []);
  };

  // ------------------------------------------------------------
  // ADD TIME ENTRY
  // ------------------------------------------------------------
  const handleAddTimeEntry = async () => {
    if (!selectedProject || parseFloat(hours) <= 0) {
      toast({
        title: "Invalid Entry",
        description: "Select a project and enter hours.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.functions.invoke("log-hours", {
      body: {
        employee_id: user.id,
        project_id: selectedProject,
        work_date: format(selectedDate, "yyyy-MM-dd"),
        hours: parseFloat(hours),
        notes: notes || null,
      },
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Hours Saved",
      description: "Time log has been added.",
    });

    setHours("0");
    setNotes("");
    setIsAddingEntry(false);
    loadEntriesForDate();
  };

  // ------------------------------------------------------------
  // WEEKLY REPORT + PROJECT BREAKDOWN
  // ------------------------------------------------------------
  const [weeklyReport, setWeeklyReport] = useState<any[]>([]);
  const [projectBreakdown, setProjectBreakdown] = useState<any[]>([]);
  const [range, setRange] = useState("7");

  const loadWeeklyReport = async () => {
    if (!user) return;

    const { data, error } = await supabase.functions.invoke(
      "get-weekly-report",
      {
        body: { employee_id: user.id },
      }
    );

    if (!error) setWeeklyReport(data ?? []);
  };

  const loadProjectBreakdown = async () => {
    if (!user) return;

    const { data, error } = await supabase.functions.invoke(
      "get-project-breakdown",
      {
        body: { employee_id: user.id, range },
      }
    );

    if (!error) setProjectBreakdown(data);
  };

  useEffect(() => {
    loadProjects();
    loadWeeklyReport();
  }, [user]);

  useEffect(() => {
    loadProjectBreakdown();
  }, [user, range]);

  useEffect(() => {
    loadEntriesForDate();
  }, [selectedDate, user]);

  const totalHoursForSelectedDate = entries.reduce(
    (s, e) => s + e.hours,
    0
  );

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <DashboardLayout title="Time Tracking">
      <div className="grid gap-4 md:grid-cols-3">
        {/* LEFT — CALENDAR */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Pick a day to log/view hours</CardDescription>
          </CardHeader>

          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              className="rounded-md border"
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            <div>
              <p className="text-sm font-medium">Selected</p>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "PPP")}
              </p>
            </div>

            {!isAddingEntry && (
              <Button onClick={() => setIsAddingEntry(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Hours
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* RIGHT — ENTRY FORM / ENTRY LIST */}
        <Card className="md:col-span-2">
          {isAddingEntry ? (
            <>
              <CardHeader>
                <CardTitle>Add Time Entry</CardTitle>
                <CardDescription>
                  {format(selectedDate, "PPP")}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Project */}
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select
                      value={selectedProject}
                      onValueChange={setSelectedProject}
                    >
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
                      onChange={(e) =>
                        setHours(e.target.value)
                      }
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe your work"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingEntry(false)}
                >
                  Cancel
                </Button>

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
                    <CardDescription>
                      {format(selectedDate, "PPP")}
                    </CardDescription>
                  </div>

                  <Badge className="text-base" variant="secondary">
                    {totalHoursForSelectedDate} Hours
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {entries.length > 0 ? (
                  <div className="space-y-3">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex justify-between p-3 border rounded-lg bg-card"
                      >
                        <div>
                          <h4 className="font-medium">
                            {entry.project_name}
                          </h4>

                          {entry.notes && (
                            <p className="text-sm text-muted-foreground">
                              {entry.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{entry.hours} hrs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />

                    <h3 className="text-xl font-medium mb-2">
                      No Time Entries
                    </h3>

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

      {/* ------------------------------------------------------------ */}
      {/* REPORTS SECTION */}
      {/* ------------------------------------------------------------ */}
      <Tabs defaultValue="daily" className="mt-8">
        <TabsList>
          <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="projects">Project Breakdown</TabsTrigger>
        </TabsList>

        {/* DAILY SUMMARY */}
        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Daily Hours Summary</CardTitle>

                <Badge variant="secondary" className="text-base">
                  {totalHoursForSelectedDate} Hours
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {entries.length === 0 ? (
                <p className="text-muted-foreground">
                  No entries for this day.
                </p>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between p-3 border rounded-lg bg-card"
                    >
                      <div>
                        <h4 className="font-medium">
                          {entry.project_name}
                        </h4>

                        {entry.notes && (
                          <p className="text-sm text-muted-foreground">
                            {entry.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{entry.hours} hours</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WEEKLY REPORT */}
        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Report</CardTitle>
              <CardDescription>Last 7 days overview</CardDescription>
            </CardHeader>

            <CardContent>
              {weeklyReport.length === 0 ? (
                <p className="text-muted-foreground">No data available</p>
              ) : (
                <div className="space-y-3">
                  {weeklyReport.map((day) => (
                    <div
                      key={day.date}
                      className="flex justify-between p-3 border rounded-lg bg-card"
                    >
                      <div>{format(new Date(day.date), "PPP")}</div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{day.total_hours} hrs</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROJECT BREAKDOWN */}
        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Breakdown</CardTitle>
              <CardDescription>
                Visualize where your time is being spent
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* FILTER BUTTONS */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={range === "7" ? "default" : "outline"}
                  onClick={() => setRange("7")}
                >
                  Last 7 Days
                </Button>

                <Button
                  variant={range === "30" ? "default" : "outline"}
                  onClick={() => setRange("30")}
                >
                  Last 30 Days
                </Button>

                <Button
                  variant={range === "all" ? "default" : "outline"}
                  onClick={() => setRange("all")}
                >
                  All Time
                </Button>
              </div>

              {/* DONUT CHART */}
              {projectBreakdown.length > 0 && (
                <div className="flex justify-center my-6">
                  <PieChart width={350} height={350}>
                    <Pie
                      data={projectBreakdown}
                      dataKey="total_hours"
                      nameKey="project_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={3}
                      label
                    >
                      {projectBreakdown.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              )}

              {/* LIST BREAKDOWN */}
              <div className="space-y-3">
                {projectBreakdown.map((p) => (
                  <div
                    key={p.project_name}
                    className="flex justify-between p-3 border rounded-lg bg-card"
                  >
                    <span>{p.project_name}</span>
                    <span className="font-semibold">
                      {p.total_hours} hrs
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default TimeTracking;
