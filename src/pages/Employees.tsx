import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  UserPlus, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Clock,
  BadgeIndianRupee,
  Tag,
  Loader2,
  Edit,
  MoreVertical
} from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useEmployees, Employee } from "@/hooks/useEmployees";
import { EditEmployeeDialog } from "@/components/EditEmployeeDialog";

// Department colors
const departmentColors = {
  "Maintenance": "#22c55e",
  "Development": "#0ea5e9",
  "Social": "#8b5cf6",
  "Performance": "#f97316"
};

// Form schema for adding a new employee
const employeeFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  department: z.enum(["Maintenance", "Development", "Social", "Performance"], {
    required_error: "Please select a department."
  }),
  role: z.string().min(2, { message: "Role must be at least 2 characters." }),
  joiningDate: z.string().min(1, { message: "Please select a joining date." }),
  experience: z.coerce.number().nonnegative({ message: "Experience must be a positive number." }),
  skills: z.string().min(2, { message: "Please enter at least one skill." }),
  ctc: z.coerce.number().positive({ message: "CTC must be a positive number." }),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

const Employees = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const { toast } = useToast();
  const { employees, loading, error, addEmployee, editEmployee } = useEmployees();
  
  // React Hook Form
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      department: "Development",
      role: "",
      joiningDate: new Date().toISOString().split("T")[0],
      experience: 0,
      skills: "",
      ctc: 0,
    },
  });
  
  // Filter employees based on search and department filter
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = !departmentFilter || departmentFilter === "all" || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });
  
  // Format currency as Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate department statistics
  const getDepartmentStats = () => {
    const departments = ["Maintenance", "Development", "Social", "Performance"];
    const stats = departments.map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      return {
        name: dept,
        value: deptEmployees.length,
        color: departmentColors[dept as keyof typeof departmentColors],
        avgUtilization: deptEmployees.length > 0 
          ? deptEmployees.reduce((acc, e) => acc + e.utilization, 0) / deptEmployees.length 
          : 0
      };
    });
    return stats;
  };
  
  const departmentStats = getDepartmentStats();
  
  // Calculate experience distribution
  const getExperienceData = () => {
    return [
      { name: "0-2 years", value: employees.filter(e => e.experience <= 2).length },
      { name: "3-5 years", value: employees.filter(e => e.experience > 2 && e.experience <= 5).length },
      { name: "6+ years", value: employees.filter(e => e.experience > 5).length }
    ];
  };
  
  const experienceData = getExperienceData();
  const experienceColors = ["#0ea5e9", "#8b5cf6", "#22c55e"];

  // Handle form submission for adding a new employee
  async function onSubmit(data: EmployeeFormValues) {
    const result = await addEmployee({
      ...data,
      skills: data.skills.split(',').map(s => s.trim()),
    });

    if (result.success) {
      toast({
        title: "Employee added",
        description: `${data.name} has been added to the team.`,
      });
      setOpenAddDialog(false);
      form.reset();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add employee",
        variant: "destructive",
      });
    }
  }

  // Handle editing an employee
  const handleEditEmployee = async (employeeId: string, data: any) => {
    const result = await editEmployee(employeeId, data);

    if (result.success) {
      toast({
        title: "Employee updated",
        description: "Employee information has been updated successfully.",
      });
      return { success: true };
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update employee",
        variant: "destructive",
      });
      return { success: false, error: result.error };
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Employees">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading employees...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Employees">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading employees:</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employees">
      <Tabs defaultValue="employees" className="w-full">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
        </TabsList>
        
        {/* Employees Tab */}
        <TabsContent value="employees" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Employee List - First Column */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={departmentFilter || undefined} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Department</SelectLabel>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Social">Social</SelectItem>
                      <SelectItem value="Performance">Performance</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Employee List ({filteredEmployees.length})</h3>
                <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-1">
                      <UserPlus className="h-4 w-4" />
                      <span>Add Employee</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to add a new employee to the system.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="+91 9876543210" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Development">Development</SelectItem>
                                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                                      <SelectItem value="Social">Social</SelectItem>
                                      <SelectItem value="Performance">Performance</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job Role</FormLabel>
                                <FormControl>
                                  <Input placeholder="Frontend Developer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="joiningDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Joining Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="experience"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Experience (Years)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" step="0.5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="ctc"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CTC (INR)</FormLabel>
                                <FormControl>
                                  <Input type="number" min="0" step="50000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Skills (Comma Separated)</FormLabel>
                              <FormControl>
                                <Input placeholder="React, JavaScript, TypeScript" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter skills separated by commas (e.g., React, TypeScript, UI/UX).
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setOpenAddDialog(false)} type="button">
                            Cancel
                          </Button>
                          <Button type="submit">Add Employee</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <Card
                      key={employee.id}
                      className={`cursor-pointer hover:border-primary transition-colors ${
                        selectedEmployee?.id === employee.id ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{employee.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium truncate">{employee.name}</h4>
                              <div className="flex items-center gap-1">
                                <Badge
                                  className={`bg-opacity-20 text-opacity-100`}
                                  style={{ 
                                    backgroundColor: `${departmentColors[employee.department]}20`,
                                    color: departmentColors[employee.department],
                                    borderColor: `${departmentColors[employee.department]}40`
                                  }}
                                >
                                  {employee.department}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingEmployee(employee);
                                        setOpenEditDialog(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Employee
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {employee.role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No employees found</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Employee Details - Second & Third Column */}
            {selectedEmployee ? (
              <>
                {/* Employee Profile - Second Column */}
                <Card className="h-fit">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>{selectedEmployee.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{selectedEmployee.name}</CardTitle>
                          <CardDescription>{selectedEmployee.role}</CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge
                          className={`bg-opacity-20 text-opacity-100`}
                          style={{ 
                            backgroundColor: `${departmentColors[selectedEmployee.department]}20`,
                            color: departmentColors[selectedEmployee.department],
                            borderColor: `${departmentColors[selectedEmployee.department]}40`
                          }}
                        >
                          {selectedEmployee.department}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingEmployee(selectedEmployee);
                              setOpenEditDialog(true);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.email}</span>
                      </div>
                      {selectedEmployee.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedEmployee.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Joined on {new Date(selectedEmployee.joiningDate).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedEmployee.experience} years experience</span>
                      </div>
                      {selectedEmployee.ctc && (
                        <div className="flex items-center gap-2">
                          <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
                          <span>CTC: {formatCurrency(selectedEmployee.ctc)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedEmployee.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-muted">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Utilization</span>
                        <span>{selectedEmployee.utilization}%</span>
                      </div>
                      <Progress 
                        value={selectedEmployee.utilization} 
                        className={cn(
                          "h-2",
                          selectedEmployee.utilization >= 80 ? "bg-green-500" :
                          selectedEmployee.utilization >= 60 ? "bg-amber-500" :
                          "bg-red-500"
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Employee Projects - Third Column */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Assigned Projects</CardTitle>
                        <CardDescription>
                          Currently assigned to {selectedEmployee.projects.length} project(s)
                        </CardDescription>
                      </div>
                      <Button size="sm">
                        <span>Add Project</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedEmployee.projects.length > 0 ? (
                      selectedEmployee.projects.map((project, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-card">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{project}</h4>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No projects assigned yet.</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View Full Profile
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <Card className="col-span-2 flex items-center justify-center h-[50vh]">
                <div className="text-center p-6">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select an Employee</h3>
                  <p className="text-muted-foreground">
                    Click on an employee from the list to view their details, skills, and assigned projects.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Utilization Tab */}
        <TabsContent value="utilization" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Department Utilization</CardTitle>
                <CardDescription>Average utilization by department</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={departmentStats}
                      dataKey="avgUtilization"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${Math.round(value)}%`}
                    >
                      {departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Math.round(Number(value))}%`, 'Utilization']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Number of employees by department</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={departmentStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} employees`, '']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Utilized Employees</CardTitle>
                <CardDescription>Employees with highest utilization rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th scope="col" className="px-4 py-3">Employee</th>
                        <th scope="col" className="px-4 py-3">Department</th>
                        <th scope="col" className="px-4 py-3">Role</th>
                        <th scope="col" className="px-4 py-3">Utilization</th>
                        <th scope="col" className="px-4 py-3">Projects</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees
                        .sort((a, b) => b.utilization - a.utilization)
                        .slice(0, 5)
                        .map((employee) => (
                          <tr key={employee.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>{employee.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{employee.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={`bg-opacity-20 text-opacity-100`}
                                style={{ 
                                  backgroundColor: `${departmentColors[employee.department]}20`,
                                  color: departmentColors[employee.department],
                                  borderColor: `${departmentColors[employee.department]}40`
                                }}
                              >
                                {employee.department}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">{employee.role}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={employee.utilization} 
                                  className={cn(
                                    "h-2 w-24",
                                    employee.utilization >= 80 ? "bg-green-500" :
                                    employee.utilization >= 60 ? "bg-amber-500" :
                                    "bg-red-500"
                                  )}
                                />
                                <span>{employee.utilization}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{employee.projects.length}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Skills Matrix Tab */}
        <TabsContent value="skills" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Experience Distribution</CardTitle>
                    <CardDescription>Employee distribution by experience</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={experienceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {experienceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={experienceColors[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} employees`, '']} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Skills</CardTitle>
                <CardDescription>Most common skills across the agency</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Count skill occurrences
                  const skillCounts = employees.flatMap(e => e.skills).reduce((acc, skill) => {
                    acc[skill] = (acc[skill] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  // Convert to array and sort
                  const sortedSkills = Object.entries(skillCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10);
                    
                  return (
                    <div className="space-y-4">
                      {sortedSkills.map(([skill, count], index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{skill}</span>
                            <span className="text-sm text-muted-foreground">{count} employees</span>
                          </div>
                          <Progress 
                            value={(count / employees.length) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Skills by Department</CardTitle>
                <CardDescription>Distribution of key skills across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {(["Development", "Maintenance", "Social", "Performance"] as const).map((dept) => {
                    // Get all skills for this department
                    const deptEmployees = employees.filter(e => e.department === dept);
                    const deptSkills = deptEmployees.flatMap(e => e.skills);
                    
                    // Count skill occurrences
                    const skillCounts = deptSkills.reduce((acc, skill) => {
                      acc[skill] = (acc[skill] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    // Get top 5 skills
                    const topSkills = Object.entries(skillCounts)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5);
                    
                    return (
                      <div key={dept}>
                        <h4 
                          className="font-semibold mb-2" 
                          style={{ color: departmentColors[dept] }}
                        >
                          {dept} Department
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {topSkills.map(([skill, count], index) => (
                            <div
                              key={index}
                              className="rounded-full px-3 py-1 text-sm border flex items-center gap-1"
                              style={{ 
                                backgroundColor: `${departmentColors[dept]}10`,
                                borderColor: `${departmentColors[dept]}30`
                              }}
                            >
                              <Tag className="h-3.5 w-3.5" style={{ color: departmentColors[dept] }} />
                              <span>{skill}</span>
                              <Badge 
                                variant="outline" 
                                className="ml-1 h-5 text-xs"
                                style={{ 
                                  backgroundColor: `${departmentColors[dept]}20`,
                                  borderColor: `${departmentColors[dept]}30`,
                                  color: departmentColors[dept],
                                }}
                              >
                                {count}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        employee={editingEmployee}
        onSave={handleEditEmployee}
      />
    </DashboardLayout>
  );
};

export default Employees;
