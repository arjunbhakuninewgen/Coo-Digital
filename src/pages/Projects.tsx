import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormDescription, FormField,
  FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ----------------------------
// Types
// ----------------------------
interface Project {
  id: string;
  name: string;
  client: string;
  category: "Maintenance" | "Development" | "Social" | "Performance";
  status: "inprogress" | "billed" | "awaitingPO" | "awaitingPayment" | "overdue";
  type: "retainer" | "fixed";
  value: number;
  startDate: string;
  endDate?: string;
  team: string[];
}

// ----------------------------
// Constants
// ----------------------------
const statusLabels = {
  inprogress: "In Progress",
  billed: "Billed",
  awaitingPO: "Awaiting PO",
  awaitingPayment: "Awaiting Payment",
  overdue: "Overdue",
};

const categoryColors = {
  Maintenance: "bg-green-100 text-green-800 border-green-200",
  Development: "bg-blue-100 text-blue-800 border-blue-200",
  Social: "bg-purple-100 text-purple-800 border-purple-200",
  Performance: "bg-orange-100 text-orange-800 border-orange-200",
};

// ----------------------------
// Form Schema
// ----------------------------
const projectFormSchema = z.object({
  name: z.string().min(2, { message: "Project name must be at least 2 characters." }),
  client: z.string().min(2, { message: "Client name must be at least 2 characters." }),
  category: z.enum(["Maintenance", "Development", "Social", "Performance"]),
  status: z.enum(["inprogress", "billed", "awaitingPO", "awaitingPayment", "overdue"]),
  type: z.enum(["retainer", "fixed"]),
  value: z.coerce.number().positive({ message: "Project value must be a positive number." }),
  startDate: z.string().min(1, { message: "Please select a start date." }),
  endDate: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

// ----------------------------
// Component
// ----------------------------
const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      client: "",
      category: "Development",
      status: "inprogress",
      type: "fixed",
      value: 0,
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch Projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted: Project[] = (data || []).map((p: any) => ({
        id: String(p.id),
        name: String(p.name || "Untitled"),
        client: String(p.description || "N/A"),
        category: (["Maintenance", "Development", "Social", "Performance"].includes(p.category)
          ? (p.category as Project["category"])
          : "Development"),
        status: (p.status as Project["status"]) || "inprogress",
        type: "fixed",
        value: 0,
        startDate: String(p.start_date || new Date().toISOString()),
        endDate: p.end_date || undefined,
        team: [],
      }));

      setProjects(formatted);
    } catch (err: any) {
      toast({
        title: "Error loading projects",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

   // Automatically fetch projects when page loads
  useEffect(() => {
    let mounted = true;
    const loadProjects = async () => {
      toast({ title: "Loading projects...", description: "Fetching from Supabase" });
      await fetchProjects();
      if (mounted) {
        toast({ title: "✅ Projects loaded", description: "Fetched successfully from Supabase" });
      }
    };
    loadProjects();
    return () => {
      mounted = false;
    };
  }, []);


  // Create Project
  async function onSubmit(data: ProjectFormValues) {
    try {
      toast({ title: "Creating...", description: "Please wait..." });

      const { data: response, error } = await supabase.functions.invoke("create-project", {
        body: {
          name: data.name,
          description: data.client,
          start_date: data.startDate,
          end_date: data.endDate || null,
          status: data.status,
        },
      });

      if (error) throw error;

      toast({
        title: "✅ Project created",
        description: `${data.name} has been added successfully.`,
      });

      await fetchProjects(); // Refresh list after creation
      setOpenNewProjectDialog(false);
      form.reset();
    } catch (err: any) {
      toast({
        title: "Error creating project",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  // Filtering
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || project.category === categoryFilter;
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesType = !typeFilter || project.type === typeFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <DashboardLayout title="Projects">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects or clients..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>

            {/* ✅ Fixed dialog trigger - now clickable */}
            <Dialog open={openNewProjectDialog} onOpenChange={setOpenNewProjectDialog}>
              <DialogTrigger>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new project.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E-commerce Website Redesign" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* client */}
                      <FormField
                        control={form.control}
                        name="client"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC Company" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* category */}
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Development">Development</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Social">Social</SelectItem>
                                <SelectItem value="Performance">Performance</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* status */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="inprogress">In Progress</SelectItem>
                                <SelectItem value="billed">Billed</SelectItem>
                                <SelectItem value="awaitingPO">Awaiting PO</SelectItem>
                                <SelectItem value="awaitingPayment">Awaiting Payment</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* type */}
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select project type" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">Fixed Bid</SelectItem>
                                <SelectItem value="retainer">Retainer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* value */}
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Value (INR)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="1000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* start & end dates */}
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date (Optional)</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormDescription>Leave blank for ongoing projects</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setOpenNewProjectDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Project</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ---------------- Table ---------------- */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
                <CardDescription>
                  {loading ? "Loading projects..." : `Showing ${filteredProjects.length} of ${projects.length} projects`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-muted-foreground py-6">Fetching projects...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted">
                        <tr>
                          <th className="px-4 py-3">Project</th>
                          <th className="px-4 py-3">Client</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Start Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.length > 0 ? (
                          filteredProjects.map((project) => (
                            <tr key={project.id} className="border-b hover:bg-muted/50">
                              <td className="px-4 py-3 font-medium flex items-center gap-2">
                                <FileSearch className="h-4 w-4" /> {project.name}
                              </td>
                              <td className="px-4 py-3">{project.client}</td>
                              <td className="px-4 py-3">
                                <Badge variant="outline" className={cn("border", categoryColors[project.category])}>
                                  {project.category}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">{statusLabels[project.status]}</td>
                              <td className="px-4 py-3 capitalize">{project.type}</td>
                              <td className="px-4 py-3">{new Date(project.startDate).toLocaleDateString("en-IN")}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-4 py-5 text-center text-muted-foreground">
                              No projects found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
