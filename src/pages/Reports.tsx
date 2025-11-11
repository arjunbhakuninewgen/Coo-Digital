import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";
import { Download, FileText, BarChart3, PieChart, LineChart as LineChartIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import BudgetVsActualTrendChart from "@/components/BudgetVsActualTrendChart";

// Mock data for reports
const monthlyRevenueData = [
  { name: "Jan", development: 480000, maintenance: 320000, social: 210000, performance: 280000 },
  { name: "Feb", development: 520000, maintenance: 340000, social: 220000, performance: 290000 },
  { name: "Mar", development: 540000, maintenance: 360000, social: 230000, performance: 310000 },
  { name: "Apr", development: 580000, maintenance: 380000, social: 240000, performance: 330000 },
  { name: "May", development: 620000, maintenance: 400000, social: 250000, performance: 350000 },
  { name: "Jun", development: 660000, maintenance: 420000, social: 260000, performance: 370000 }
];

const clientRevenueData = [
  { name: "ABC Retail", value: 850000, color: "#0ea5e9" },
  { name: "XYZ Corp", value: 225000, color: "#22c55e" },
  { name: "LMN Brands", value: 320000, color: "#8b5cf6" },
  { name: "PQR Solutions", value: 175000, color: "#f97316" },
  { name: "Global Tech", value: 1250000, color: "#f59e0b" },
  { name: "Others", value: 180000, color: "#64748b" }
];

const employeeUtilizationData = [
  { name: "Raj Kumar", utilization: 85 },
  { name: "Priya Singh", utilization: 70 },
  { name: "Vikram Reddy", utilization: 90 },
  { name: "Neha Patel", utilization: 95 },
  { name: "Karthik Iyer", utilization: 80 },
  { name: "Deepak Mehta", utilization: 75 },
  { name: "Sneha Jain", utilization: 85 },
  { name: "Amit Sharma", utilization: 80 },
  { name: "Ananya Gupta", utilization: 90 },
  { name: "Vishal Shah", utilization: 70 }
];

const projectStatusData = [
  { name: "In Progress", value: 12, color: "#0ea5e9" },
  { name: "Billed", value: 8, color: "#22c55e" },
  { name: "Awaiting PO", value: 5, color: "#f59e0b" },
  { name: "Awaiting Payment", value: 7, color: "#f97316" },
  { name: "Overdue", value: 3, color: "#ef4444" }
];

const Reports = () => {
  const [yearFilter, setYearFilter] = useState("2025");
  const [monthFilter, setMonthFilter] = useState("All");
  const { toast } = useToast();
  
  // Format currency as Indian Rupees
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format department name with proper capitalization
  const formatDepartmentName = (name: string | number): string => {
    // If name is a number, convert it to string first
    const nameStr = String(name);
    return nameStr.charAt(0).toUpperCase() + nameStr.slice(1);
  };
  
  const handleReportDownload = (reportType: string) => {
    toast({
      title: "Report Download Started",
      description: `${reportType} report is being prepared for download.`,
    });
  };

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <div className="flex gap-2">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Month</SelectLabel>
                  <SelectItem value="All">All Months</SelectItem>
                  <SelectItem value="Jan">January</SelectItem>
                  <SelectItem value="Feb">February</SelectItem>
                  <SelectItem value="Mar">March</SelectItem>
                  <SelectItem value="Apr">April</SelectItem>
                  <SelectItem value="May">May</SelectItem>
                  <SelectItem value="Jun">June</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Year</SelectLabel>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="financial" className="w-full">
          <TabsList>
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
            <TabsTrigger value="projects">Project Reports</TabsTrigger>
            <TabsTrigger value="employees">Employee Reports</TabsTrigger>
            <TabsTrigger value="clients">Client Reports</TabsTrigger>
          </TabsList>
          
          {/* Financial Reports Tab */}
          <TabsContent value="financial" className="mt-4 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Financial Reports</h2>
              <Button 
                variant="outline" 
                onClick={() => handleReportDownload("Financial")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>

            {/* Add Budget vs Actual Trend Chart */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Financial Year Budget vs Actual with Projections</CardTitle>
                <CardDescription>Department-wise comparison with future projections based on opportunities and employee costs</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <BudgetVsActualTrendChart 
                  height={350}
                  chartType="bar"
                />
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Department</CardTitle>
                  <CardDescription>Monthly revenue breakdown by department</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyRevenueData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                      <Legend />
                      <Line type="monotone" dataKey="development" stroke="#0ea5e9" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="maintenance" stroke="#22c55e" />
                      <Line type="monotone" dataKey="social" stroke="#8b5cf6" />
                      <Line type="monotone" dataKey="performance" stroke="#f97316" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Client</CardTitle>
                  <CardDescription>Distribution of revenue across major clients</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={clientRevenueData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {clientRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Revenue Trend</CardTitle>
                  <CardDescription>Total revenue trend for {yearFilter}</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={monthlyRevenueData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                      <Tooltip 
                        formatter={(value, name) => [
                          formatCurrency(Number(value)), 
                          formatDepartmentName(name)
                        ]} 
                      />
                      <Legend />
                      <Bar dataKey="development" name="Development" fill="#0ea5e9" />
                      <Bar dataKey="maintenance" name="Maintenance" fill="#22c55e" />
                      <Bar dataKey="social" name="Social" fill="#8b5cf6" />
                      <Bar dataKey="performance" name="Performance" fill="#f97316" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Available Financial Reports</CardTitle>
                  <CardDescription>Download detailed financial reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      {
                        title: "Monthly Revenue Report",
                        description: "Detailed breakdown of revenue by month",
                        icon: LineChartIcon
                      },
                      {
                        title: "Department P&L",
                        description: "Profit and loss by department",
                        icon: BarChart3
                      },
                      {
                        title: "Client Revenue Analysis",
                        description: "Revenue distribution by client",
                        icon: PieChart
                      },
                      {
                        title: "Overdue Payments Report",
                        description: "List of all overdue client payments",
                        icon: FileText
                      },
                      {
                        title: "Expense Report",
                        description: "Breakdown of all agency expenses",
                        icon: FileText
                      },
                      {
                        title: "Quarterly Financial Summary",
                        description: "Quarterly financial performance",
                        icon: LineChartIcon
                      }
                    ].map((report, index) => {
                      const Icon = report.icon;
                      return (
                        <Card key={index} className="bg-card hover:bg-muted/50 cursor-pointer">
                          <CardContent className="p-4 flex flex-col items-center text-center">
                            <div className="bg-primary/10 p-3 rounded-full mb-3">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-medium mb-1">{report.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {report.description}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-auto gap-1"
                              onClick={() => handleReportDownload(report.title)}
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Project Reports Tab */}
          <TabsContent value="projects" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Reports</h2>
              <Button 
                variant="outline" 
                onClick={() => handleReportDownload("Project")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                  <CardDescription>Breakdown of projects by current status</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} projects`, '']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Available Project Reports</CardTitle>
                  <CardDescription>Download detailed project reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Project Status Report",
                        description: "Status of all active projects",
                        icon: FileText,
                      },
                      {
                        title: "Project Timeline Analysis",
                        description: "Timeline tracking and forecasting",
                        icon: LineChartIcon,
                      },
                      {
                        title: "Milestone Completion Report",
                        description: "Progress against project milestones",
                        icon: BarChart3,
                      },
                      {
                        title: "Project Profitability Analysis",
                        description: "Profit margins by project type",
                        icon: PieChart,
                      }
                    ].map((report, index) => {
                      const Icon = report.icon;
                      return (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{report.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {report.description}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReportDownload(report.title)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employee Reports Tab */}
          <TabsContent value="employees" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Employee Reports</h2>
              <Button 
                variant="outline" 
                onClick={() => handleReportDownload("Employee")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Employee Utilization</CardTitle>
                <CardDescription>Utilization rates for all employees</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={employeeUtilizationData.sort((a, b) => b.utilization - a.utilization)}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 100,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                    <Legend />
                    <Bar 
                      dataKey="utilization" 
                      name="Utilization" 
                      fill="#0ea5e9" 
                      label={{ position: 'right', formatter: (value: number) => `${value}%` }}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Available Employee Reports</CardTitle>
                  <CardDescription>Download detailed employee reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Employee Utilization Report",
                        description: "Detailed utilization across projects",
                        icon: BarChart3,
                      },
                      {
                        title: "Skills Distribution Report",
                        description: "Skills inventory across departments",
                        icon: PieChart,
                      },
                      {
                        title: "Experience & Tenure Analysis",
                        description: "Experience levels and tenure distribution",
                        icon: LineChartIcon,
                      },
                      {
                        title: "CTC Distribution Report",
                        description: "Salary distribution by department",
                        icon: FileText,
                      }
                    ].map((report, index) => {
                      const Icon = report.icon;
                      return (
                        <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{report.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {report.description}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReportDownload(report.title)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Department Reports</CardTitle>
                  <CardDescription>Download department-specific reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Development Team Report",
                        description: "Performance metrics for development team",
                        color: "#0ea5e9"
                      },
                      {
                        title: "Maintenance Team Report",
                        description: "Performance metrics for maintenance team",
                        color: "#22c55e"
                      },
                      {
                        title: "Social Team Report",
                        description: "Performance metrics for social team",
                        color: "#8b5cf6"
                      },
                      {
                        title: "Performance Team Report",
                        description: "Performance metrics for performance team",
                        color: "#f97316"
                      }
                    ].map((report, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-3 border rounded-lg"
                        style={{ borderLeftWidth: '4px', borderLeftColor: report.color }}
                      >
                        <div>
                          <h3 className="font-medium">{report.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {report.description}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleReportDownload(report.title)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Client Reports Tab */}
          <TabsContent value="clients" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Client Reports</h2>
              <Button 
                variant="outline" 
                onClick={() => handleReportDownload("Client")}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Available Client Reports</CardTitle>
                  <CardDescription>Download detailed client reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      {
                        title: "Client Revenue Report",
                        description: "Revenue generated by each client",
                        icon: LineChartIcon
                      },
                      {
                        title: "Client Payment Status",
                        description: "Overview of payment statuses across clients",
                        icon: FileText
                      },
                      {
                        title: "Client Feedback Analysis",
                        description: "Sentiment analysis of client feedback",
                        icon: BarChart3
                      },
                      {
                        title: "Client Visit Report",
                        description: "Summary of all client visits",
                        icon: FileText
                      },
                      {
                        title: "Client Opportunity Pipeline",
                        description: "Upcoming sales opportunities",
                        icon: PieChart
                      },
                      {
                        title: "Client Retention Analysis",
                        description: "Client retention rates and history",
                        icon: LineChartIcon
                      }
                    ].map((report, index) => {
                      const Icon = report.icon;
                      return (
                        <Card key={index} className="bg-card hover:bg-muted/50 cursor-pointer">
                          <CardContent className="p-4 flex flex-col items-center text-center">
                            <div className="bg-primary/10 p-3 rounded-full mb-3">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-medium mb-1">{report.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {report.description}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-auto gap-1"
                              onClick={() => handleReportDownload(report.title)}
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Client-Specific Reports</CardTitle>
                  <CardDescription>Generate reports for individual clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abc-retail">ABC Retail</SelectItem>
                        <SelectItem value="xyz-corp">XYZ Corp</SelectItem>
                        <SelectItem value="lmn-brands">LMN Brands</SelectItem>
                        <SelectItem value="pqr-solutions">PQR Solutions</SelectItem>
                        <SelectItem value="global-tech">Global Tech</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex justify-center">
                      <Button className="w-full">Generate Client Report</Button>
                    </div>
                    
                    <p className="text-sm text-center text-muted-foreground mt-4">
                      Select a client to generate a comprehensive report including project status, 
                      payment history, and engagement metrics.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Reports</CardTitle>
                  <CardDescription>Set up automatic report delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Select defaultValue="client-monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client-monthly">Monthly Client Report</SelectItem>
                        <SelectItem value="client-quarterly">Quarterly Client Analysis</SelectItem>
                        <SelectItem value="client-payment">Weekly Payment Status</SelectItem>
                        <SelectItem value="client-overdue">Overdue Payments Alert</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex justify-center">
                      <Button className="w-full">Schedule Report</Button>
                    </div>
                    
                    <p className="text-sm text-center text-muted-foreground mt-4">
                      Reports will be automatically generated and sent via email 
                      based on your selected frequency.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
