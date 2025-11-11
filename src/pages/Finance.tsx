import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BadgeIndianRupee, ArrowUp, ArrowDown, Calendar, CreditCard, DollarSign, Save, X, Edit, PlusCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock finance data
interface FinanceOverview {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  pendingPayments: number;
  overduePayments: number;
}

interface MonthlyBreakdown {
  month: string;
  retainerRevenue: number;
  fixedBidRevenue: number;
}

interface ClientPayment {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  projectName: string;
}

interface ClientFinanceData {
  client: string;
  totalBilled: number;
  totalPaid: number;
  overdue: number;
  exposure: number;
}

interface MonthlyBudget {
  id: string;
  month: string;
  budgetedRevenue: number;
  budgetedExpense: number;
  actualRevenue: number;
  actualExpense: number;
  departments: {
    maintenance: {
      budgetedRevenue: number;
      budgetedExpense: number;
      actualRevenue: number;
      actualExpense: number;
    };
    development: {
      budgetedRevenue: number;
      budgetedExpense: number;
      actualRevenue: number;
      actualExpense: number;
    };
    social: {
      budgetedRevenue: number;
      budgetedExpense: number;
      actualRevenue: number;
      actualExpense: number;
    };
    performance: {
      budgetedRevenue: number;
      budgetedExpense: number;
      actualRevenue: number;
      actualExpense: number;
    };
  };
}

// Department types
type Department = 'maintenance' | 'development' | 'social' | 'performance';

// Financial year months (April - March)
const financialYearMonths = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep", 
  "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
];

// Mock data
const financeOverview: FinanceOverview = {
  totalRevenue: 12900000,
  totalExpenses: 7850000,
  totalProfit: 5050000,
  pendingPayments: 3200000,
  overduePayments: 1500000
};

const revenueBreakdown = [
  { name: "Maintenance", value: 3200000, color: "#22c55e" },
  { name: "Development", value: 4800000, color: "#0ea5e9" },
  { name: "Social", value: 2100000, color: "#8b5cf6" },
  { name: "Performance", value: 2800000, color: "#f97316" }
];

const monthlyBreakdown: MonthlyBreakdown[] = [
  { month: "Apr", retainerRevenue: 950000, fixedBidRevenue: 1250000 },
  { month: "May", retainerRevenue: 950000, fixedBidRevenue: 1750000 },
  { month: "Jun", retainerRevenue: 1050000, fixedBidRevenue: 1950000 },
  { month: "Jul", retainerRevenue: 1050000, fixedBidRevenue: 2000000 },
  { month: "Aug", retainerRevenue: 1100000, fixedBidRevenue: 2200000 },
  { month: "Sep", retainerRevenue: 1100000, fixedBidRevenue: 2350000 },
  { month: "Oct", retainerRevenue: 1150000, fixedBidRevenue: 2450000 },
  { month: "Nov", retainerRevenue: 1150000, fixedBidRevenue: 2550000 },
  { month: "Dec", retainerRevenue: 1200000, fixedBidRevenue: 2650000 },
  { month: "Jan", retainerRevenue: 1200000, fixedBidRevenue: 2700000 },
  { month: "Feb", retainerRevenue: 1250000, fixedBidRevenue: 2750000 },
  { month: "Mar", retainerRevenue: 1250000, fixedBidRevenue: 2800000 }
];

const clientPayments: ClientPayment[] = [
  {
    id: "pay1",
    client: "ABC Retail",
    amount: 450000,
    dueDate: "2025-05-15",
    status: "pending",
    projectName: "E-commerce Website Redesign"
  },
  {
    id: "pay2",
    client: "XYZ Corp",
    amount: 45000,
    dueDate: "2025-05-01",
    status: "paid",
    projectName: "Monthly Website Maintenance"
  },
  {
    id: "pay3",
    client: "LMN Brands",
    amount: 320000,
    dueDate: "2025-05-10",
    status: "pending",
    projectName: "Social Media Campaign"
  },
  {
    id: "pay4",
    client: "PQR Solutions",
    amount: 35000,
    dueDate: "2025-04-30",
    status: "overdue",
    projectName: "SEO Optimization"
  },
  {
    id: "pay5",
    client: "Global Tech",
    amount: 625000,
    dueDate: "2025-04-15",
    status: "overdue",
    projectName: "Mobile App Development"
  }
];

const clientFinances: ClientFinanceData[] = [
  {
    client: "ABC Retail",
    totalBilled: 850000,
    totalPaid: 400000,
    overdue: 0,
    exposure: 450000
  },
  {
    client: "XYZ Corp",
    totalBilled: 225000,
    totalPaid: 225000,
    overdue: 0,
    exposure: 0
  },
  {
    client: "LMN Brands",
    totalBilled: 320000,
    totalPaid: 0,
    overdue: 0,
    exposure: 320000
  },
  {
    client: "PQR Solutions",
    totalBilled: 175000,
    totalPaid: 140000,
    overdue: 35000,
    exposure: 35000
  },
  {
    client: "Global Tech",
    totalBilled: 1250000,
    totalPaid: 625000,
    overdue: 625000,
    exposure: 625000
  }
];

// Initialize monthly budget data with department-wise breakdowns
const initialMonthlyBudgetData: MonthlyBudget[] = financialYearMonths.map((month, index) => {
  const monthData = monthlyBreakdown.find(m => m.month === month);
  const actualRevenue = monthData 
    ? monthData.retainerRevenue + monthData.fixedBidRevenue 
    : 0;
  
  // Calculate department percentages based on overall revenue breakdown
  const maintenancePercentage = revenueBreakdown[0].value / financeOverview.totalRevenue;
  const developmentPercentage = revenueBreakdown[1].value / financeOverview.totalRevenue;
  const socialPercentage = revenueBreakdown[2].value / financeOverview.totalRevenue;
  const performancePercentage = revenueBreakdown[3].value / financeOverview.totalRevenue;
  
  // Calculate department-specific revenues
  const maintenanceRevenue = Math.round(actualRevenue * maintenancePercentage);
  const developmentRevenue = Math.round(actualRevenue * developmentPercentage);
  const socialRevenue = Math.round(actualRevenue * socialPercentage);
  const performanceRevenue = Math.round(actualRevenue * performancePercentage);
  
  return {
    id: `budget-${index}`,
    month: month,
    budgetedRevenue: Math.round(actualRevenue * 1.1), // Initial budget 10% higher than actual
    budgetedExpense: Math.round(actualRevenue * 0.6), // Example expense calculation
    actualRevenue: actualRevenue,
    actualExpense: Math.round(actualRevenue * 0.65), // Example actual expense
    departments: {
      maintenance: {
        budgetedRevenue: Math.round(maintenanceRevenue * 1.1),
        budgetedExpense: Math.round(maintenanceRevenue * 0.6),
        actualRevenue: maintenanceRevenue,
        actualExpense: Math.round(maintenanceRevenue * 0.65)
      },
      development: {
        budgetedRevenue: Math.round(developmentRevenue * 1.1),
        budgetedExpense: Math.round(developmentRevenue * 0.6),
        actualRevenue: developmentRevenue,
        actualExpense: Math.round(developmentRevenue * 0.65)
      },
      social: {
        budgetedRevenue: Math.round(socialRevenue * 1.1),
        budgetedExpense: Math.round(socialRevenue * 0.6),
        actualRevenue: socialRevenue,
        actualExpense: Math.round(socialRevenue * 0.65)
      },
      performance: {
        budgetedRevenue: Math.round(performanceRevenue * 1.1),
        budgetedExpense: Math.round(performanceRevenue * 0.6),
        actualRevenue: performanceRevenue,
        actualExpense: Math.round(performanceRevenue * 0.65)
      }
    }
  };
});

const Finance = () => {
  const [yearFilter, setYearFilter] = useState("2025");
  const [monthlyBudgetData, setMonthlyBudgetData] = useState<MonthlyBudget[]>(initialMonthlyBudgetData);
  const [editingBudget, setEditingBudget] = useState<MonthlyBudget | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const { toast } = useToast();
  
  // Format currency as Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format currency in compact form
  const formatCurrencyCompact = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount}`;
  };

  const handleEditBudget = (budget: MonthlyBudget) => {
    setEditingBudget({...budget});
    setIsEditDialogOpen(true);
  };

  const handleSaveBudget = () => {
    if (!editingBudget) return;
    
    setMonthlyBudgetData(prev => 
      prev.map(item => 
        item.id === editingBudget.id ? editingBudget : item
      )
    );
    
    setIsEditDialogOpen(false);
    setEditingBudget(null);
    
    toast({
      title: "Budget updated",
      description: `Budget for ${editingBudget.month} has been updated successfully.`,
    });
  };

  const calculateBudgetVariance = (budget: MonthlyBudget, type: 'revenue' | 'expense', department?: Department) => {
    if (department) {
      if (type === 'revenue') {
        const variance = budget.departments[department].actualRevenue - budget.departments[department].budgetedRevenue;
        const percentVariance = budget.departments[department].budgetedRevenue > 0 
          ? (variance / budget.departments[department].budgetedRevenue) * 100 
          : 0;
        return {
          variance,
          percentVariance,
          isPositive: variance >= 0
        };
      } else {
        const variance = budget.departments[department].budgetedExpense - budget.departments[department].actualExpense;
        const percentVariance = budget.departments[department].budgetedExpense > 0 
          ? (variance / budget.departments[department].budgetedExpense) * 100 
          : 0;
        return {
          variance,
          percentVariance,
          isPositive: variance >= 0
        };
      }
    } else {
      // Use the original calculation for overall budget
      if (type === 'revenue') {
        const variance = budget.actualRevenue - budget.budgetedRevenue;
        const percentVariance = budget.budgetedRevenue > 0 
          ? (variance / budget.budgetedRevenue) * 100 
          : 0;
        return {
          variance,
          percentVariance,
          isPositive: variance >= 0
        };
      } else {
        const variance = budget.budgetedExpense - budget.actualExpense;
        const percentVariance = budget.budgetedExpense > 0 
          ? (variance / budget.budgetedExpense) * 100 
          : 0;
        return {
          variance,
          percentVariance,
          isPositive: variance >= 0
        };
      }
    }
  };

  const getCurrentFinancialYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
    
    // If current month is January to March, we are in the previous year's financial year
    if (currentMonth >= 1 && currentMonth <= 3) {
      return `${currentYear-1}-${currentYear}`;
    } else {
      return `${currentYear}-${currentYear+1}`;
    }
  };

  const handleUpdateDepartmentBudget = (
    department: Department, 
    field: 'budgetedRevenue' | 'budgetedExpense',
    value: number
  ) => {
    if (!editingBudget) return;
    
    setEditingBudget(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        departments: {
          ...prev.departments,
          [department]: {
            ...prev.departments[department],
            [field]: value
          }
        },
        // Update overall budget totals when department budgets change
        [field]: field === 'budgetedRevenue' 
          ? prev.departments.maintenance.budgetedRevenue + 
            prev.departments.development.budgetedRevenue + 
            prev.departments.social.budgetedRevenue + 
            prev.departments.performance.budgetedRevenue +
            (department === 'maintenance' ? value - prev.departments.maintenance[field] : 0) +
            (department === 'development' ? value - prev.departments.development[field] : 0) +
            (department === 'social' ? value - prev.departments.social[field] : 0) +
            (department === 'performance' ? value - prev.departments.performance[field] : 0)
          : prev.departments.maintenance.budgetedExpense + 
            prev.departments.development.budgetedExpense + 
            prev.departments.social.budgetedExpense + 
            prev.departments.performance.budgetedExpense +
            (department === 'maintenance' ? value - prev.departments.maintenance[field] : 0) +
            (department === 'development' ? value - prev.departments.development[field] : 0) +
            (department === 'social' ? value - prev.departments.social[field] : 0) +
            (department === 'performance' ? value - prev.departments.performance[field] : 0)
      };
    });
  };

  return (
    <DashboardLayout title="Finance">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Financial Overview</h2>
            <p className="text-muted-foreground">Financial Year: {getCurrentFinancialYear()}</p>
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <BadgeIndianRupee className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold rupee-symbol">{(financeOverview.totalRevenue / 10000000).toFixed(1)}Cr</div>
              <p className="text-xs text-muted-foreground">
                <span className="flex items-center text-emerald-500">
                  <ArrowUp className="h-4 w-4 mr-1" /> +12%
                </span>
                from previous {yearFilter}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold rupee-symbol">{(financeOverview.totalProfit / 10000000).toFixed(1)}Cr</div>
              <p className="text-xs text-muted-foreground">
                <span className="flex items-center text-emerald-500">
                  <ArrowUp className="h-4 w-4 mr-1" /> +8%
                </span>
                from previous {yearFilter}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Calendar className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold rupee-symbol">{(financeOverview.pendingPayments / 100000).toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">
                <span className="flex items-center text-amber-500">
                  <ArrowUp className="h-4 w-4 mr-1" /> +5%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <CreditCard className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500 rupee-symbol">{(financeOverview.overduePayments / 100000).toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">
                <span className="flex items-center text-red-500">
                  <ArrowUp className="h-4 w-4 mr-1" /> +15%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Distribution across departments</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Financial Exposure</CardTitle>
              <CardDescription>Outstanding amounts by client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {clientFinances.map((client) => (
                  <div key={client.client} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{client.client}</h4>
                        <div className="text-xs text-muted-foreground">
                          Paid: {formatCurrency(client.totalPaid)} / {formatCurrency(client.totalBilled)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {client.overdue > 0 ? (
                            <span className="text-red-500">Overdue: {formatCurrency(client.overdue)}</span>
                          ) : (
                            <span className="text-emerald-500">No overdue</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Exposure: {formatCurrency(client.exposure)}
                        </div>
                      </div>
                    </div>
                    <Progress value={client.totalPaid / client.totalBilled * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="budget" className="w-full">
          <TabsList>
            <TabsTrigger value="budget">Budget Management</TabsTrigger>
            <TabsTrigger value="payments">Upcoming Payments</TabsTrigger>
            <TabsTrigger value="revenue">Monthly Revenue</TabsTrigger>
          </TabsList>
          
          <TabsContent value="budget" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Monthly Budget Management</CardTitle>
                  <CardDescription>Financial Year {getCurrentFinancialYear()}</CardDescription>
                </div>
                <Select 
                  value={selectedDepartment} 
                  onValueChange={(value) => setSelectedDepartment(value as Department | 'all')}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Department</SelectLabel>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Budgeted Revenue</TableHead>
                        <TableHead>Actual Revenue</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>Budgeted Expense</TableHead>
                        <TableHead>Actual Expense</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyBudgetData.map((budget) => {
                        let revenueVariance;
                        let expenseVariance;
                        
                        if (selectedDepartment !== 'all') {
                          revenueVariance = calculateBudgetVariance(budget, 'revenue', selectedDepartment as Department);
                          expenseVariance = calculateBudgetVariance(budget, 'expense', selectedDepartment as Department);
                        } else {
                          revenueVariance = calculateBudgetVariance(budget, 'revenue');
                          expenseVariance = calculateBudgetVariance(budget, 'expense');
                        }
                        
                        return (
                          <TableRow key={budget.id}>
                            <TableCell className="font-medium">{budget.month}</TableCell>
                            <TableCell>
                              {selectedDepartment !== 'all' 
                                ? formatCurrency(budget.departments[selectedDepartment as Department].budgetedRevenue)
                                : formatCurrency(budget.budgetedRevenue)
                              }
                            </TableCell>
                            <TableCell>
                              {selectedDepartment !== 'all'
                                ? formatCurrency(budget.departments[selectedDepartment as Department].actualRevenue)
                                : formatCurrency(budget.actualRevenue)
                              }
                            </TableCell>
                            <TableCell>
                              <span className={revenueVariance.isPositive ? "text-green-600" : "text-red-600"}>
                                {revenueVariance.isPositive ? "+" : ""}{formatCurrency(revenueVariance.variance)} 
                                ({revenueVariance.isPositive ? "+" : ""}{revenueVariance.percentVariance.toFixed(1)}%)
                              </span>
                            </TableCell>
                            <TableCell>
                              {selectedDepartment !== 'all'
                                ? formatCurrency(budget.departments[selectedDepartment as Department].budgetedExpense)
                                : formatCurrency(budget.budgetedExpense)
                              }
                            </TableCell>
                            <TableCell>
                              {selectedDepartment !== 'all'
                                ? formatCurrency(budget.departments[selectedDepartment as Department].actualExpense)
                                : formatCurrency(budget.actualExpense)
                              }
                            </TableCell>
                            <TableCell>
                              <span className={expenseVariance.isPositive ? "text-green-600" : "text-red-600"}>
                                {expenseVariance.isPositive ? "+" : ""}{formatCurrency(expenseVariance.variance)}
                                ({expenseVariance.isPositive ? "+" : ""}{expenseVariance.percentVariance.toFixed(1)}%)
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditBudget(budget)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Track pending and overdue payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th scope="col" className="px-4 py-3">Client</th>
                        <th scope="col" className="px-4 py-3">Project</th>
                        <th scope="col" className="px-4 py-3">Amount</th>
                        <th scope="col" className="px-4 py-3">Due Date</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{payment.client}</td>
                          <td className="px-4 py-3">{payment.projectName}</td>
                          <td className="px-4 py-3">{formatCurrency(payment.amount)}</td>
                          <td className="px-4 py-3">{new Date(payment.dueDate).toLocaleDateString('en-IN')}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                payment.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                payment.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                'bg-red-100 text-red-800 border-red-200'
                              }
                            >
                              {payment.status === 'paid' ? 'Paid' :
                               payment.status === 'pending' ? 'Pending' : 'Overdue'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Breakdown</CardTitle>
                <CardDescription>Comparison of retainer vs. fixed bid revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th scope="col" className="px-4 py-3">Month</th>
                        <th scope="col" className="px-4 py-3">Retainer Revenue</th>
                        <th scope="col" className="px-4 py-3">Fixed Bid Revenue</th>
                        <th scope="col" className="px-4 py-3">Total</th>
                        <th scope="col" className="px-4 py-3">% From Retainer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyBreakdown.map((month) => {
                        const total = month.retainerRevenue + month.fixedBidRevenue;
                        const retainerPercentage = (month.retainerRevenue / total * 100).toFixed(0);
                        
                        return (
                          <tr key={month.month} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">{month.month}</td>
                            <td className="px-4 py-3">{formatCurrency(month.retainerRevenue)}</td>
                            <td className="px-4 py-3">{formatCurrency(month.fixedBidRevenue)}</td>
                            <td className="px-4 py-3 font-medium">{formatCurrency(total)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span>{retainerPercentage}%</span>
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary" 
                                    style={{ width: `${retainerPercentage}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Budget Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Budget for {editingBudget?.month}</DialogTitle>
              <DialogDescription>
                Update the budgeted revenue and expense amounts for each department.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Maintenance Department</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="maintenanceRevenue" className="text-sm font-medium">
                      Budgeted Revenue
                    </label>
                    <Input
                      id="maintenanceRevenue"
                      type="number"
                      value={editingBudget?.departments.maintenance.budgetedRevenue || 0}
                      onChange={(e) => handleUpdateDepartmentBudget('maintenance', 'budgetedRevenue', Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="maintenanceExpense" className="text-sm font-medium">
                      Budgeted Expense
                    </label>
                    <Input
                      id="maintenanceExpense"
                      type="number"
                      value={editingBudget?.departments.maintenance.budgetedExpense || 0}
                      onChange={(e) => handleUpdateDepartmentBudget('maintenance', 'budgetedExpense', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Development Department</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="developmentRevenue" className="text-sm font-medium">
                      Budgeted Revenue
                    </label>
                    <Input
                      id="developmentRevenue"
                      type="number"
                      value={editingBudget?.departments.development.budgetedRevenue || 0}
                      onChange={(e) => handleUpdateDepartmentBudget('development', 'budgetedRevenue', Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="developmentExpense" className="text-sm font-medium">
                      Budgeted Expense
                    </label>
                    <Input
                      id="developmentExpense"
                      type="number"
                      value={editingBudget?.departments.development.budgetedExpense || 0}
                      onChange={(e) => handleUpdateDepartmentBudget('development', 'budgetedExpense', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Social Department</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="socialRevenue" className="text-sm font-medium">
                      Budgeted Revenue
                    </label>
                    <Input
                      id="socialRevenue"
                      type="number"
                      value={editingBudget?.departments.social.budgetedRevenue || 0}
                      onChange={(e) => handleUpdateDepartmentBudget('social', 'budgetedRevenue', Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="socialExpense" className="text-sm font-medium">
                      Budgeted Expense
                    </label>
                    <Input
                      id="socialExpense"
                      type="number"
                      value={editingBudget?.departments.social.budgetedExpense || 0}
                      onChange={(e) => handleUpdateDepartmentBudget('social', 'budgetedExpense', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Performance Department</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="performanceRevenue" className="text-sm font-medium">
                      Budgeted Revenue
                    </label>
                    <Input
                      id="performanceRevenue"
                      type="number"
                      value={editingBudget?.departments.performance.budgetedRevenue || 0}
                      onChange={(e) => handleUpdateDepartmentBudget('performance', 'budgetedRevenue', Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="performanceExpense" className="text-sm font-medium">
                      Budgeted Expense
                    </label>
                    <Input
                      id="performanceExpense"
                      type="number"
                      value={editingBudget?.departments.performance.budgetedExpense || 0}
                      onChange={(e) => handleUpdateDepartmentBudget('performance', 'budgetedExpense', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Total Budget</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <span className="text-sm font-medium">Total Budgeted Revenue</span>
                    <div className="px-4 py-2 bg-muted/50 rounded-md">
                      {editingBudget ? formatCurrency(editingBudget.budgetedRevenue) : "₹0"}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <span className="text-sm font-medium">Total Budgeted Expense</span>
                    <div className="px-4 py-2 bg-muted/50 rounded-md">
                      {editingBudget ? formatCurrency(editingBudget.budgetedExpense) : "₹0"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" onClick={handleSaveBudget}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Finance;
