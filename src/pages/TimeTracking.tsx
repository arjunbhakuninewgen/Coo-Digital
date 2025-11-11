
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Save, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Mock projects data
const projects = [
  { id: "proj1", name: "E-commerce Website Redesign" },
  { id: "proj2", name: "Mobile App Development" },
  { id: "proj3", name: "SEO Optimization" },
];

interface TimeEntry {
  id: string;
  projectId: string;
  date: Date;
  hours: number;
  notes: string;
}

const TimeTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [hours, setHours] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState<boolean>(false);

  // Load previous entries
  useEffect(() => {
    // In a real app, fetch from API/database
    const mockEntries: TimeEntry[] = [
      {
        id: "entry1",
        projectId: "proj1", 
        date: new Date(2025, 4, 5), // May 5, 2025
        hours: 6,
        notes: "Worked on UI components"
      },
      {
        id: "entry2",
        projectId: "proj2",
        date: new Date(2025, 4, 4), // May 4, 2025
        hours: 4,
        notes: "Fixed API integration issues"
      },
    ];
    
    setTimeEntries(mockEntries);
  }, []);
  
  // Track entries by date
  const entriesForSelectedDate = timeEntries.filter(
    entry => entry.date.toDateString() === selectedDate.toDateString()
  );
  
  // Sum hours for selected date
  const totalHoursForSelectedDate = entriesForSelectedDate.reduce(
    (sum, entry) => sum + entry.hours, 0
  );
  
  // Add time entry
  const handleAddTimeEntry = () => {
    if (!selectedProject || parseFloat(hours) <= 0) {
      toast({
        title: "Invalid Entry",
        description: "Please select a project and enter valid hours",
        variant: "destructive",
      });
      return;
    }
    
    const newEntry: TimeEntry = {
      id: `entry${Date.now()}`,
      projectId: selectedProject,
      date: selectedDate,
      hours: parseFloat(hours),
      notes: notes,
    };
    
    setTimeEntries([...timeEntries, newEntry]);
    toast({
      title: "Time Entry Added",
      description: `Added ${hours} hours for ${projects.find(p => p.id === selectedProject)?.name}`,
    });
    
    // Reset form
    setHours("0");
    setNotes("");
    setIsAddingEntry(false);
  };
  
  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || "Unknown Project";
  };
  
  return (
    <DashboardLayout title="Time Tracking">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Calendar Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Pick a date to log or view hours</CardDescription>
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
              <p className="text-sm font-medium">Selected Date</p>
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
        
        {/* Entry Form or Time Entries Card */}
        <Card className="md:col-span-2">
          {isAddingEntry ? (
            <>
              <CardHeader>
                <CardTitle>Add Time Entry</CardTitle>
                <CardDescription>Log your hours for {format(selectedDate, "PPP")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours Worked</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What did you work on?"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
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
                    <CardTitle>Time Entries</CardTitle>
                    <CardDescription>
                      Logged hours for {format(selectedDate, "PPP")}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {totalHoursForSelectedDate} Hours
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {entriesForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {entriesForSelectedDate.map(entry => (
                      <div key={entry.id} className="flex justify-between p-3 border rounded-lg bg-card">
                        <div>
                          <h4 className="font-medium">{getProjectName(entry.projectId)}</h4>
                          {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
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
                      No hours logged for this date. Click "Add Hours" to log your time.
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>
      
      {/* Time Reports Section */}
      <Tabs defaultValue="daily" className="mt-8">
        <TabsList>
          <TabsTrigger value="daily">Daily Summary</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="projects">Projects Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Hours Summary</CardTitle>
              <CardDescription>Your recent time tracking activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would have charts or detailed breakdowns in a real application */}
                {/* For now, just showing a simplified table */}
                <table className="w-full text-sm">
                  <thead className="text-xs bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Projects</th>
                      <th className="px-4 py-2 text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(new Set(timeEntries.map(entry => entry.date.toDateString())))
                      .map(dateStr => {
                        const entriesForDate = timeEntries.filter(entry => entry.date.toDateString() === dateStr);
                        const totalHours = entriesForDate.reduce((sum, entry) => sum + entry.hours, 0);
                        const projectCount = new Set(entriesForDate.map(entry => entry.projectId)).size;
                        const date = new Date(dateStr);
                        
                        return (
                          <tr key={dateStr} className="border-b">
                            <td className="px-4 py-3">{format(date, "MMM d, yyyy")}</td>
                            <td className="px-4 py-3">{projectCount} project(s)</td>
                            <td className="px-4 py-3 text-right font-medium">{totalHours} hours</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Report</CardTitle>
              <CardDescription>This week's time tracking summary</CardDescription>
            </CardHeader>
            <CardContent>
              {/* This would have real data in an actual implementation */}
              <div className="text-center py-8">
                <p className="text-muted-foreground">Weekly report feature coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Projects Breakdown</CardTitle>
              <CardDescription>Time spent on each project</CardDescription>
            </CardHeader>
            <CardContent>
              {/* This would have real data in an actual implementation */}
              <div className="text-center py-8">
                <p className="text-muted-foreground">Project breakdown feature coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default TimeTracking;
