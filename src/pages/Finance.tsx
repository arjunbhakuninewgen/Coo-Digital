// src/pages/Finance.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BadgeIndianRupee,
  ArrowUp,
  Calendar,
  CreditCard,
  DollarSign,
  Save,
  X,
  Edit,
  PlusCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// Types
type Department = "maintenance" | "development" | "social" | "performance";

interface MonthlyBudget {
  id: string;
  month: string;
  year: number;
  department: Department; // ✅ Add this line
  budgetedRevenue: number;
  budgetedExpense: number;
  actualRevenue: number;
  actualExpense: number;
  departments: Record<
    Department,
    {
      budgetedRevenue: number;
      budgetedExpense: number;
      actualRevenue: number;
      actualExpense: number;
    }
  >;
}

interface ClientPayment {
  id: string;
  client: string;
  projectName: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
}

// Financial year months
const financialYearMonths = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

const Finance = () => {
  const [yearFilter, setYearFilter] = useState("2025");
  const [monthlyBudgetData, setMonthlyBudgetData] = useState<MonthlyBudget[]>(
    []
  );
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [financeOverview, setFinanceOverview] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    pendingPayments: 0,
    overduePayments: 0,
  });
  const { toast } = useToast();

  // Edit budget dialog state
  const [editingBudget, setEditingBudget] = useState<MonthlyBudget | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Add budget dialog state
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [newBudget, setNewBudget] = useState<{
    month: string;
    year: number;
    department: Department;
    budgetedRevenue: number;
    budgetedExpense: number;
  }>({
    month: "",
    year: new Date().getFullYear(),
    department: "maintenance",
    budgetedRevenue: 0,
    budgetedExpense: 0,
  });

  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  const [revenueBreakdown, setRevenueBreakdown] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);

  useEffect(() => {
    const fetchLookups = async () => {
      const { data: clientsData } = await (supabase as any)
        .from("clients")
        .select("id, name");
      const { data: projectsData } = await (supabase as any)
        .from("projects")
        .select("id, name");
      setClients(clientsData || []);
      setProjects(projectsData || []);
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      const { data, error } = await supabase.functions.invoke(
        "get-finance-summary",
        {
          body: { year: Number(yearFilter) },
        }
      );
      if (error) throw error;
      const result = data as any;

      setFinanceOverview({
        totalRevenue: result.totalRevenue,
        totalExpenses: result.monthlyTrend.reduce(
          (a: number, m: any) => a + m.expense,
          0
        ),
        totalProfit: result.monthlyTrend.reduce(
          (a: number, m: any) => a + (m.revenue - m.expense),
          0
        ),
        pendingPayments: result.pendingPayments,
        overduePayments: result.overduePayments,
      });

      setRevenueBreakdown(result.departmentBreakdown);
      setMonthlyTrend(result.monthlyTrend);
    };

    fetchSummary().catch((err) =>
      toast({
        title: "Error loading summary",
        description: err.message,
        variant: "destructive",
      })
    );
  }, [yearFilter]);

  // Add payment dialog state
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [newPayment, setNewPayment] = useState<{
    client_id: string;
    project_id: string;
    amount: number;
    due_date: string;
    status: "pending" | "paid" | "overdue";
    notes: string;
  }>({
    client_id: "",
    project_id: "",
    amount: 0,
    due_date: "",
    status: "pending",
    notes: "",
  });

  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | "all"
  >("all");

  // Format currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const getCurrentFinancialYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    if (currentMonth >= 1 && currentMonth <= 3) {
      return `${currentYear - 1}-${currentYear}`;
    } else {
      return `${currentYear}-${currentYear + 1}`;
    }
  };

  // Fetch finance + budget data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch invoices/payments
        const startDate = `${yearFilter}-01-01`;
        const endDate = `${yearFilter}-12-31`;

        const { data: invoices, error: invoicesError } = await (supabase as any)
          .from("client_invoices")
          .select(
            `
    id,
    amount,
    due_date,
    paid_date,
    status,
    clients:client_id(name),
    projects:project_id(name)
  `
          )
          .gte("due_date", startDate)
          .lte("due_date", endDate);

        if (invoicesError) throw invoicesError;

        const payments: ClientPayment[] = (invoices || []).map((inv) => ({
          id: inv.id,
          client: inv.clients?.name ?? "Unknown",
          projectName: inv.projects?.name ?? "-",
          amount: inv.amount,
          dueDate: inv.due_date,
          status: inv.status,
        }));

        setClientPayments(payments);

        const totalRevenue = (invoices || []).reduce(
          (sum: number, inv: any) =>
            inv.status === "paid" ? sum + inv.amount : sum,
          0
        );
        const pendingPayments = (invoices || []).reduce(
          (sum: number, inv: any) =>
            inv.status === "pending" ? sum + inv.amount : sum,
          0
        );
        const overduePayments = (invoices || []).reduce(
          (sum: number, inv: any) =>
            inv.status === "overdue" ? sum + inv.amount : sum,
          0
        );

        setFinanceOverview({
          totalRevenue,
          totalExpenses: Math.round(totalRevenue * 0.6),
          totalProfit: Math.round(totalRevenue * 0.4),
          pendingPayments,
          overduePayments,
        });

        // Fetch budgets
        const { data: budgets, error: budgetsError } = await supabase
          .from("department_budgets")
          .select("*")
          .eq("year", Number(yearFilter));
        if (budgetsError) throw budgetsError;

        const transformed: MonthlyBudget[] = (budgets || []).map((b: any) => ({
          id: b.id,
          month: b.month,
          year: b.year,
          department: b.department,
          budgetedRevenue: b.budgeted_revenue,
          budgetedExpense: b.budgeted_expense,
          actualRevenue: b.actual_revenue,
          actualExpense: b.actual_expense,
          departments: {
            maintenance: {
              budgetedRevenue: Math.round(b.budgeted_revenue * 0.25),
              budgetedExpense: Math.round(b.budgeted_expense * 0.25),
              actualRevenue: Math.round(b.actual_revenue * 0.25),
              actualExpense: Math.round(b.actual_expense * 0.25),
            },
            development: {
              budgetedRevenue: Math.round(b.budgeted_revenue * 0.35),
              budgetedExpense: Math.round(b.budgeted_expense * 0.35),
              actualRevenue: Math.round(b.actual_revenue * 0.35),
              actualExpense: Math.round(b.actual_expense * 0.35),
            },
            social: {
              budgetedRevenue: Math.round(b.budgeted_revenue * 0.2),
              budgetedExpense: Math.round(b.budgeted_expense * 0.2),
              actualRevenue: Math.round(b.actual_revenue * 0.2),
              actualExpense: Math.round(b.actual_expense * 0.2),
            },
            performance: {
              budgetedRevenue: Math.round(b.budgeted_revenue * 0.2),
              budgetedExpense: Math.round(b.budgeted_expense * 0.2),
              actualRevenue: Math.round(b.actual_revenue * 0.2),
              actualExpense: Math.round(b.actual_expense * 0.2),
            },
          },
        }));
        setMonthlyBudgetData(transformed);
      } catch (error: any) {
        console.error("Finance data fetch error:", error);
        toast({
          title: "Error loading finance data",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [yearFilter]);

  // Edit budget handlers
  const handleEditBudget = (budget: MonthlyBudget) => {
    setEditingBudget({ ...budget });
    setIsEditDialogOpen(true);
  };

  const handleSaveBudget = async () => {
    if (!editingBudget) return;

    try {
      const { data, error } = await supabase.functions.invoke(
        "update-department-budget",
        {
          body: editingBudget,
        }
      );
      if (error) throw error;

      setMonthlyBudgetData((prev) =>
        prev.map((b) => (b.id === editingBudget.id ? editingBudget : b))
      );
      toast({
        title: "Budget updated",
        description: `Budget for ${editingBudget.month}-${editingBudget.year} updated.`,
      });
      setIsEditDialogOpen(false);
      setEditingBudget(null);
    } catch (error: any) {
      console.error("Save budget error:", error);
      toast({
        title: "Error saving budget",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Add budget handler
  const handleAddBudget = async () => {
    const { month, year, department, budgetedRevenue, budgetedExpense } =
      newBudget;

    // Validation
    if (!month) {
      toast({
        title: "Validation error",
        description: "Please select a month.",
        variant: "destructive",
      });
      return;
    }
    if (budgetedRevenue <= 0) {
      toast({
        title: "Validation error",
        description: "Budgeted revenue must be > 0.",
        variant: "destructive",
      });
      return;
    }
    if (budgetedExpense < 0) {
      toast({
        title: "Validation error",
        description: "Budgeted expense cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    // Duplicate check
    const existing = monthlyBudgetData.find(
      (b) => b.month === month && b.year === year
    );
    if (existing) {
      toast({
        title: "Duplicate entry",
        description: `Budget for ${month}-${year} already exists.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("department_budgets")
        .insert([
          {
            month,
            year,
            department,
            budgeted_revenue: budgetedRevenue,
            budgeted_expense: budgetedExpense,
            actual_revenue: 0,
            actual_expense: 0,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Budget added",
        description: `Budget for ${month}-${year} created.`,
      });
      setIsAddBudgetOpen(false);
      const newId = (data as any)[0].id;

      setMonthlyBudgetData((prev): MonthlyBudget[] => [
        ...prev,
        {
          id: newId,
          month,
          year,
          department, // ✅ Add this line
          budgetedRevenue,
          budgetedExpense,
          actualRevenue: 0,
          actualExpense: 0,
          departments: {
            maintenance: {
              budgetedRevenue: 0,
              budgetedExpense: 0,
              actualRevenue: 0,
              actualExpense: 0,
            },
            development: {
              budgetedRevenue: 0,
              budgetedExpense: 0,
              actualRevenue: 0,
              actualExpense: 0,
            },
            social: {
              budgetedRevenue: 0,
              budgetedExpense: 0,
              actualRevenue: 0,
              actualExpense: 0,
            },
            performance: {
              budgetedRevenue: 0,
              budgetedExpense: 0,
              actualRevenue: 0,
              actualExpense: 0,
            },
          },
        },
      ]);

      setNewBudget({
        month: "",
        year,
        department: "maintenance",
        budgetedRevenue: 0,
        budgetedExpense: 0,
      });
    } catch (error: any) {
      console.error("Add budget error:", error);
      toast({
        title: "Error adding budget",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Add payment handler
  const handleAddPayment = async () => {
    if (!newPayment.client_id || !newPayment.amount || !newPayment.due_date) {
      toast({
        title: "Validation error",
        description: "Client, amount, and due date are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("add-invoice", {
        body: newPayment,
      });
      if (error) throw error;

      toast({ title: "Payment added successfully" });
      setIsAddPaymentOpen(false);
      // Refresh or pull data again:
      setClientPayments((prev) => [
        ...prev,
        {
          id: (data as any)[0].id,
          client:
            clients.find((c) => c.id === newPayment.client_id)?.name ??
            "Unknown",
          projectName:
            projects.find((p) => p.id === newPayment.project_id)?.name ??
            "Unknown",
          amount: newPayment.amount,
          dueDate: newPayment.due_date,
          status: newPayment.status,
        },
      ]);
    } catch (error: any) {
      console.error("Add payment error:", error);
      toast({
        title: "Error adding payment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Finance">
      <div className="space-y-4">
        {/* Overview Cards */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Financial Overview</h2>
            <p className="text-muted-foreground">
              Financial Year: {getCurrentFinancialYear()}
            </p>
          </div>
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

        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue by Category (Pie Chart) */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Distribution across departments</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {(revenueBreakdown.length
                      ? revenueBreakdown
                      : [
                          { color: "#22c55e" },
                          { color: "#0ea5e9" },
                          { color: "#8b5cf6" },
                          { color: "#f97316" },
                        ]
                    ).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString()}`, "Allocation"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue vs Expense Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expense Trend</CardTitle>
              <CardDescription>Monthly income pattern</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(v) => [`₹${v.toLocaleString()}`, "Amount"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="retainerRevenue"
                    stroke="#0ea5e9"
                    name="Retainer"
                  />
                  <Line
                    type="monotone"
                    dataKey="fixedBidRevenue"
                    stroke="#22c55e"
                    name="Fixed Bid"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <BadgeIndianRupee className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold rupee-symbol">
                {(financeOverview.totalRevenue / 10000000).toFixed(1)}Cr
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="flex items-center text-emerald-500">
                  <ArrowUp className="h-4 w-4 mr-1" /> +12%
                </span>
                from previous {yearFilter}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Profit
              </CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold rupee-symbol">
                {(financeOverview.totalProfit / 10000000).toFixed(1)}Cr
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <Calendar className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold rupee-symbol">
                {(financeOverview.pendingPayments / 100000).toFixed(1)}L
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Payments
              </CardTitle>
              <CreditCard className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500 rupee-symbol">
                {(financeOverview.overduePayments / 100000).toFixed(1)}L
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="payments" className="w-full">
          <TabsList>
            <TabsTrigger value="payments">Upcoming Payments</TabsTrigger>
            <TabsTrigger value="budget">Budgets</TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="mt-4">
            <Card>
              <CardHeader className="flex justify-between items-center mb-4">
                <div>
                  <CardTitle>Upcoming Payments</CardTitle>
                  <CardDescription>
                    Track pending & overdue invoices
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddPaymentOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Payment
                </Button>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientPayments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.client}</TableCell>
                          <TableCell>{p.projectName}</TableCell>
                          <TableCell>{formatCurrency(p.amount)}</TableCell>
                          <TableCell>
                            {new Date(p.dueDate).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                p.status === "paid"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : p.status === "pending"
                                  ? "bg-amber-100 text-amber-800 border-amber-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              }
                            >
                              {p.status === "paid"
                                ? "Paid"
                                : p.status === "pending"
                                ? "Pending"
                                : "Overdue"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {clientPayments.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-6 text-muted-foreground"
                          >
                            No payments found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="mt-4">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle>Department Budgets</CardTitle>
                  <CardDescription>
                    Adjust and save monthly budgets
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddBudgetOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Budget
                </Button>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month-Year</TableHead>
                        <TableHead>Department</TableHead> {/* ✅ Added */}
                        <TableHead>Budgeted Revenue</TableHead>
                        <TableHead>Actual Revenue</TableHead>
                        <TableHead>Budgeted Expense</TableHead>
                        <TableHead>Actual Expense</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyBudgetData.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">
                            {b.month}-{b.year}
                          </TableCell>
                          <TableCell className="capitalize">
                            {b.department}
                          </TableCell>{" "}
                          {/* ✅ Added */}
                          <TableCell>
                            {formatCurrency(b.budgetedRevenue)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(b.actualRevenue)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(b.budgetedExpense)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(b.actualExpense)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditBudget(b)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Budget Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                Edit Budget for {editingBudget?.month}-{editingBudget?.year}
              </DialogTitle>
              <DialogDescription>
                Modify department and actuals
              </DialogDescription>
            </DialogHeader>

            {editingBudget && (
              <div className="grid gap-4 py-4">
                {/* Department */}
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select
                    value={editingBudget.department}
                    onValueChange={(value) =>
                      setEditingBudget((prev) =>
                        prev
                          ? { ...prev, department: value as Department }
                          : prev
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budgeted & Actual Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Budgeted Revenue
                    </label>
                    <Input
                      type="number"
                      value={editingBudget.budgetedRevenue}
                      onChange={(e) =>
                        setEditingBudget((prev) =>
                          prev
                            ? { ...prev, budgetedRevenue: +e.target.value }
                            : prev
                        )
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Budgeted Expense
                    </label>
                    <Input
                      type="number"
                      value={editingBudget.budgetedExpense}
                      onChange={(e) =>
                        setEditingBudget((prev) =>
                          prev
                            ? { ...prev, budgetedExpense: +e.target.value }
                            : prev
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Actual Revenue
                    </label>
                    <Input
                      type="number"
                      value={editingBudget.actualRevenue}
                      onChange={(e) =>
                        setEditingBudget((prev) =>
                          prev
                            ? { ...prev, actualRevenue: +e.target.value }
                            : prev
                        )
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      Actual Expense
                    </label>
                    <Input
                      type="number"
                      value={editingBudget.actualExpense}
                      onChange={(e) =>
                        setEditingBudget((prev) =>
                          prev
                            ? { ...prev, actualExpense: +e.target.value }
                            : prev
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSaveBudget}>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Budget Dialog */}
        <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Budget</DialogTitle>
              <DialogDescription>Define new monthly budget</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <label className="text-sm font-medium">Select Month</label>
              <Select
                value={newBudget.month}
                onValueChange={(value) =>
                  setNewBudget((prev) => ({ ...prev, month: value }))
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {financialYearMonths.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="text-sm font-medium">Select Department</label>
              <Select
                value={newBudget.department}
                onValueChange={(value) =>
                  setNewBudget((prev) => ({
                    ...prev,
                    department: value as Department,
                  }))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Department</SelectLabel>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <label className="text-sm font-medium">Budgeted Revenue</label>
              <Input
                type="number"
                placeholder="Enter budgeted revenue"
                value={newBudget.budgetedRevenue}
                onChange={(e) =>
                  setNewBudget((prev) => ({
                    ...prev,
                    budgetedRevenue: +e.target.value,
                  }))
                }
              />

              <label className="text-sm font-medium">Budgeted Expense</label>
              <Input
                type="number"
                placeholder="Enter budgeted expense"
                value={newBudget.budgetedExpense}
                onChange={(e) =>
                  setNewBudget((prev) => ({
                    ...prev,
                    budgetedExpense: +e.target.value,
                  }))
                }
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddBudgetOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddBudget}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Payment Dialog */}
        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
              <DialogDescription>
                Enter new client payment details
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <label className="text-sm font-medium">Client</label>
              <Select
                value={newPayment.client_id}
                onValueChange={(value) =>
                  setNewPayment((prev) => ({ ...prev, client_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <label className="text-sm font-medium">Project</label>
              <Select
                value={newPayment.project_id}
                onValueChange={(value) =>
                  setNewPayment((prev) => ({ ...prev, project_id: value }))
                }
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

              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    amount: +e.target.value,
                  }))
                }
              />

              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={newPayment.due_date}
                onChange={(e) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    due_date: e.target.value,
                  }))
                }
              />

              <label className="text-sm font-medium">Status</label>
              <Select
                value={newPayment.status}
                onValueChange={(v) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    status: v as "pending" | "paid" | "overdue",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <label className="text-sm font-medium">Notes</label>
              <Input
                placeholder="Enter any notes"
                value={newPayment.notes}
                onChange={(e) =>
                  setNewPayment((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddPaymentOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddPayment}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Finance;
