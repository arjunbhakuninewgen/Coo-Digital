import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BadgeIndianRupee,
  ClipboardCheck,
  Calendar,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  Bar,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  BarChart as RechartsBarChart,
} from "recharts";
import BudgetVsActualTrendChart from "@/components/BudgetVsActualTrendChart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // fetch data from edge function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("get-dashboard");

      if (error) throw error;

      setDashboardData(data);
    } catch (err: any) {
      toast({
        title: "Error loading dashboard",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // handle data safely
  const employees = dashboardData?.employees || [];
  const projects = dashboardData?.projects || [];
  const skills = dashboardData?.skills || [];
  const empProjects = dashboardData?.employee_projects || [];
  const empSkills = dashboardData?.employee_skills || [];

  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const totalSkills = skills.length;

  // derive some analytics
  const projectStatusData = projects.reduce((acc: any, p: any) => {
    const key = p.status || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const projectStatusChartData = Object.entries(projectStatusData).map(
    ([name, value]) => ({
      name,
      value,
      color:
        name === "inprogress"
          ? "#0ea5e9"
          : name === "billed"
          ? "#22c55e"
          : name === "awaitingPO"
          ? "#f59e0b"
          : name === "awaitingPayment"
          ? "#f97316"
          : "#ef4444",
    })
  );

  const departmentRevenue = [
    { name: "Maintenance", value: 320000, color: "#22c55e" },
    { name: "Development", value: 480000, color: "#0ea5e9" },
    { name: "Social", value: 210000, color: "#8b5cf6" },
    { name: "Performance", value: 280000, color: "#f97316" },
  ];

  const monthlyRevenue = [
    { name: "Jan", revenue: 280000 },
    { name: "Feb", revenue: 320000 },
    { name: "Mar", revenue: 350000 },
    { name: "Apr", revenue: 410000 },
    { name: "May", revenue: 480000 },
  ];

  const formatCurrency = (value: number) => `₹${(value / 1000).toFixed(0)}K`;

  return (
    <DashboardLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* Top summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Total registered employees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Projects
                </CardTitle>
                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  Across all departments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills</CardTitle>
                <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSkills}</div>
                <p className="text-xs text-muted-foreground">
                  Unique skills in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assignments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{empProjects.length}</div>
                <p className="text-xs text-muted-foreground">
                  Employee-project links
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="mt-4 mb-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>
                  Revenue and cost tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <BudgetVsActualTrendChart height={350} chartType="bar" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>
                  Revenue trend (mock data for now)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip
                      formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0ea5e9"
                      fill="#0ea5e9"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>Current project distribution</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={projectStatusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {projectStatusChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} projects`, ""]} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Revenue by Department</CardTitle>
                <CardDescription>
                  Distribution of revenue across teams
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={departmentRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip
                      formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="value">
                      {departmentRevenue.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
