// src/pages/Finance.tsx
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { Edit, PlusCircle } from "lucide-react";

type Department = "maintenance" | "development" | "social" | "performance";

interface ClientPayment {
  id: string;
  client: string;
  projectName: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  notes?: string;
}

interface ProjectProfit {
  project_id: string;
  project_name: string;
  client_name: string;
  revenue: number;
  est_cost: number;
  profit: number;
  margin: number | null;
}

const colors = ["#0ea5e9", "#22c55e", "#f97316", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function Finance() {
  const { toast } = useToast();
  const [yearFilter, setYearFilter] = useState("2025");
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [financeOverview, setFinanceOverview] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    totalExpenses: 0,
    totalProfit: 0,
  });

  // charts / lists
  const [deptBreakdown, setDeptBreakdown] = useState<{ name: string; value: number; color?: string }[]>([]);
  const [clientBreakdown, setClientBreakdown] = useState<{ name: string; value: number; color?: string }[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [agingBuckets, setAgingBuckets] = useState<{ bucket: string; value: number }[]>([]);
  const [topOverdue, setTopOverdue] = useState<ClientPayment[]>([]);
  const [projectProfitability, setProjectProfitability] = useState<ProjectProfit[]>([]);

  // dialogs
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<ClientPayment | null>(null);

  // helpers
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    loadAll();
  }, [yearFilter]);

  async function loadAll() {
    setOverviewLoading(true);
    await Promise.all([loadOverview(), loadInvoices(), loadDeptAndClientBreakdown(), loadMonthlyTrend(), loadProjectProfitability(), loadAging()]);
    setOverviewLoading(false);
  }

  async function loadOverview() {
    try {
      const res = await supabase.functions.invoke("get-finance-summary", { body: { year: Number(yearFilter) } });
      if (res.error) throw res.error;
      const data = res.data ?? res;
      // normalize
      setFinanceOverview({
        totalRevenue: data.totalRevenue ?? 0,
        pendingPayments: data.pendingPayments ?? 0,
        overduePayments: data.overduePayments ?? 0,
        totalExpenses: data.totalExpenses ?? (data.monthlyTrend ? data.monthlyTrend.reduce((a: number, m: any) => a + (m.expense || 0), 0) : 0),
        totalProfit: data.totalProfit ?? 0,
      });

      // dept & monthly if provided
      if (data.departmentBreakdown) {
        setDeptBreakdown(
          (data.departmentBreakdown || []).map((d: any, i: number) => ({ name: d.department || d.name, value: Number(d.actual_revenue ?? d.value ?? 0), color: colors[i % colors.length] }))
        );
      }
      if (data.clientBreakdown) {
        setClientBreakdown(
          (data.clientBreakdown || []).map((c: any, i: number) => ({ name: c.client || c.name, value: Number(c.value ?? c.revenue ?? 0), color: colors[i % colors.length] }))
        );
      }
      if (data.monthlyTrend) {
        // ensure array of { month, revenue, expense }
        setMonthlyTrend((data.monthlyTrend || []).map((m: any) => ({ month: m.month, revenue: Number(m.revenue || 0), expense: Number(m.expense || 0) })));
      }
    } catch (err: any) {
      console.error("loadOverview", err);
      toast({ title: "Error loading overview", description: err.message, variant: "destructive" });
    }
  }

  async function loadDeptAndClientBreakdown() {
    // fallback: call the same summary function which already returns department/client breakdown
    try {
      const res = await supabase.functions.invoke("get-finance-summary", { body: { year: Number(yearFilter) } });
      if (res.error) throw res.error;
      const result = res.data ?? res;
      if (result.departmentBreakdown) {
        setDeptBreakdown(result.departmentBreakdown.map((d: any, idx: number) => ({ name: d.department, value: Number(d.actual_revenue || d.value || 0), color: colors[idx % colors.length] })));
      }
      if (result.clientBreakdown) {
        setClientBreakdown(result.clientBreakdown.map((c: any, idx: number) => ({ name: c.client || c.name, value: Number(c.value || c.revenue || 0), color: colors[idx % colors.length] })));
      } else {
        // attempt small client aggregation from invoices
        const invoices = await supabase.from("client_invoices").select("amount,status,clients:client_id(name)").eq("status", "paid");
        if (!invoices.error) {
          const map: Record<string, number> = {};
          (invoices.data || []).forEach((inv: any) => {
            const name = inv.clients?.name ?? "Unknown";
            map[name] = (map[name] || 0) + Number(inv.amount || 0);
          });
          const arr = Object.entries(map).map(([name, value], idx) => ({ name, value, color: colors[idx % colors.length] }));
          setClientBreakdown(arr);
        }
      }
    } catch (err: any) {
      console.error("loadDeptAndClientBreakdown", err);
    }
  }

  async function loadMonthlyTrend() {
    try {
      const res = await supabase.functions.invoke("get-monthly-financials", { body: { year: Number(yearFilter) } });
      if (res.error) throw res.error;
      const data = res.data ?? res;
      if (Array.isArray(data.monthlyTrend)) {
        setMonthlyTrend(data.monthlyTrend.map((m: any) => ({ month: m.month, revenue: Number(m.revenue || 0), expense: Number(m.expense || 0) })));
      }
    } catch (err) {
      // no-op
    }
  }

  async function loadInvoices() {
    try {
      const startDate = `${yearFilter}-01-01`;
      const endDate = `${yearFilter}-12-31`;
      const { data, error } = await supabase
        .from("client_invoices")
        .select(`id, amount, due_date, paid_date, status, notes, clients:client_id(name), projects:project_id(name)`)
        .gte("due_date", startDate)
        .lte("due_date", endDate)
        .order("due_date", { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map((inv: any) => ({
        id: inv.id,
        client: inv.clients?.name ?? "Unknown",
        projectName: inv.projects?.name ?? "-",
        amount: Number(inv.amount),
        dueDate: inv.due_date,
        status: inv.status,
        notes: inv.notes ?? "",
      }));
      setClientPayments(mapped);
    } catch (err: any) {
      console.error("loadInvoices", err);
      toast({ title: "Cannot load invoices", description: err.message, variant: "destructive" });
    }
  }

  async function loadAging() {
    try {
      const res = await supabase.functions.invoke("get-payment-aging", { body: { year: Number(yearFilter) } });
      if (res.error) throw res.error;
      const data = res.data ?? res;
      // expected shape { buckets: { "0-30": n, "31-60": n, "61+": n }, topOverdue: [...] }
      const buckets = data.buckets ?? {};
      setAgingBuckets([
        { bucket: "0-30", value: Number(buckets["0-30"] || 0) },
        { bucket: "31-60", value: Number(buckets["31-60"] || 0) },
        { bucket: "61+", value: Number(buckets["61+"] || 0) },
      ]);
      const top = (data.topOverdue || []).map((o: any) => ({
        id: o.id,
        client: o.client,
        projectName: o.project,
        amount: Number(o.amount || 0),
        dueDate: o.due_date,
        status: "overdue",
      }));
      setTopOverdue(top);
    } catch (err) {
      console.error("loadAging", err);
    }
  }

  async function loadProjectProfitability() {
    try {
      const res = await supabase.functions.invoke("get-project-profitability", { body: { year: Number(yearFilter) } });
      if (res.error) throw res.error;
      const data = res.data ?? res;
      // server returns array of projects: { project_id, project_name, client_name, revenue, est_cost }
      const mapped = (data || []).map((p: any) => ({
        project_id: p.project_id,
        project_name: p.project_name ?? p.name ?? "Unknown",
        client_name: p.client_name ?? p.client ?? "Unknown",
        revenue: Number(p.revenue || 0),
        est_cost: Number(p.est_cost || 0),
        profit: Number((p.revenue || 0) - (p.est_cost || 0)),
        margin: (p.revenue && p.revenue > 0) ? Math.round(((p.revenue - p.est_cost) / p.revenue) * 100) : null,
      }));
      setProjectProfitability(mapped);
    } catch (err) {
      console.error("loadProjectProfitability", err);
    }
  }

  // update invoice status
  async function onChangeInvoiceStatus(id: string, newStatus: "paid" | "pending" | "overdue") {
    try {
      const body: any = { id, status: newStatus };
      if (newStatus === "paid") body.paid_date = new Date().toISOString().slice(0, 10);
      const res = await supabase.functions.invoke("update-invoice-status", { body });
      if (res.error) throw res.error;
      toast({ title: "Invoice updated" });
      // refresh lists
      await loadInvoices();
      await loadOverview();
      await loadAging();
      await loadProjectProfitability();
    } catch (err: any) {
      console.error("onChangeInvoiceStatus", err);
      toast({ title: "Error updating invoice", description: err.message, variant: "destructive" });
    }
  }

  // small derived values
  const totalDeptRevenue = deptBreakdown.reduce((s, d) => s + d.value, 0);
  const totalClientRevenue = clientBreakdown.reduce((s, c) => s + c.value, 0);

  return (
    <DashboardLayout title="Finance">
      <div className="space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Financial Overview</h2>
            <p className="text-muted-foreground">Financial Year: {yearFilter}-{Number(yearFilter) + 1}</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={yearFilter} onValueChange={(v) => setYearFilter(v)}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Year</SelectLabel>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button onClick={() => loadAll()}>{overviewLoading ? "Refreshing..." : "Refresh"}</Button>
          </div>
        </div>

        {/* top cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
              <CardDescription>Est. change vs prev year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financeOverview.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit</CardTitle>
              <CardDescription>Net profit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financeOverview.totalProfit)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
              <CardDescription>Upcoming receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(financeOverview.pendingPayments)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overdue</CardTitle>
              <CardDescription>Action required</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(financeOverview.overduePayments)}</div>
            </CardContent>
          </Card>
        </div>

        {/* charts row */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Department</CardTitle>
              <CardDescription>Department allocation (actual)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {deptBreakdown.length === 0 ? <p className="text-muted-foreground">No revenue data for selected year</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deptBreakdown} dataKey="value" nameKey="name" outerRadius={90} label>
                      {deptBreakdown.map((entry, idx) => <Cell key={idx} fill={entry.color || colors[idx % colors.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Expense (Monthly)</CardTitle>
              <CardDescription>Last 12 months / FY</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), "Amount"]} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" name="Revenue" dot />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Expense" dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Summary (Top 5)</CardTitle>
              <CardDescription>Top contributors</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {clientBreakdown.length === 0 ? <p className="text-muted-foreground">No client revenue</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={clientBreakdown.slice(0, 5)} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label>
                      {clientBreakdown.slice(0, 5).map((entry, idx) => <Cell key={idx} fill={entry.color || colors[idx % colors.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Revenue"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs: payments/budgets/project profitability/aging */}
        <Tabs defaultValue="payments" className="w-full">
          <TabsList>
            <TabsTrigger value="payments">Upcoming Payments</TabsTrigger>
            <TabsTrigger value="profit">Project Profitability</TabsTrigger>
            <TabsTrigger value="aging">Invoice Aging</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Payments */}
          <TabsContent value="payments">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle>Upcoming Payments</CardTitle>
                  <CardDescription>Track pending & overdue invoices</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => loadInvoices()}><PlusCircle className="mr-2 h-4 w-4" />Refresh</Button>
                </div>
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientPayments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.client}</TableCell>
                          <TableCell>{p.projectName}</TableCell>
                          <TableCell>{formatCurrency(p.amount)}</TableCell>
                          <TableCell>{p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-IN") : "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={p.status === "paid" ? "bg-green-100 text-green-800" : p.status === "pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}>
                              {p.status.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 items-center">
                              <button onClick={() => { setEditingInvoice(p); setIsEditInvoiceOpen(true); }}>
                                <Edit />
                              </button>
                              {/* quick change controls */}
                              <select value={p.status} onChange={(e) => onChangeInvoiceStatus(p.id, e.target.value as any)}>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                              </select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {clientPayments.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No payments found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Project Profitability */}
          <TabsContent value="profit">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <CardTitle>Project Profitability</CardTitle>
                  <CardDescription>Revenue, estimated cost & margin</CardDescription>
                </div>
                <Button onClick={() => loadProjectProfitability()}>Refresh</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Est Cost</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Margin</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectProfitability.map((p) => (
                        <TableRow key={p.project_id}>
                          <TableCell className="font-medium">{p.project_name}</TableCell>
                          <TableCell>{p.client_name}</TableCell>
                          <TableCell>{formatCurrency(p.revenue)}</TableCell>
                          <TableCell>{formatCurrency(p.est_cost)}</TableCell>
                          <TableCell>{formatCurrency(p.profit)}</TableCell>
                          <TableCell>{p.margin === null ? "-" : `${p.margin}%`}</TableCell>
                          <TableCell><Button variant="ghost" size="sm">Details</Button></TableCell>
                        </TableRow>
                      ))}
                      {projectProfitability.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No projects found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoice Aging */}
          <TabsContent value="aging">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Aging</CardTitle>
                <CardDescription>0–30, 31–60, 61+ buckets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <CardContent style={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={agingBuckets}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="bucket" />
                          <YAxis />
                          <Tooltip formatter={(v: number) => [formatCurrency(v), "Amount"]} />
                          <Bar dataKey="value" fill="#f97316" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      {agingBuckets.map(b => <div key={b.bucket}><div className="font-medium">{b.bucket}</div><div className="text-muted-foreground">{formatCurrency(b.value)}</div></div>)}
                    </CardFooter>
                  </Card>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Overdue Invoices</CardTitle>
                        <CardDescription>Most overdue - newest</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {topOverdue.length === 0 ? <p className="text-muted-foreground">No overdue invoices</p> : topOverdue.map((o, idx) => (
                          <div key={idx} className="p-4 border rounded mb-2 flex justify-between items-center">
                            <div>
                              <div className="font-medium">{o.client}</div>
                              <div className="text-sm text-muted-foreground">{o.projectName}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(o.amount)}</div>
                              <div className="text-xs text-muted-foreground">{new Date(o.dueDate).toLocaleDateString("en-IN")}</div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budgets */}
          <TabsContent value="budgets">
            <Card>
              <CardHeader>
                <CardTitle>Department Budgets</CardTitle>
                <CardDescription>Adjust and save monthly budgets</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Use the Budgets tab below to add or edit monthly budgets.</p>
                {/* Reuse your budgets UI (you already have modals for add/edit) */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>AI Insights & Financial Health</CardTitle>
                <CardDescription>Automated insights from financial health function</CardDescription>
              </CardHeader>
              <CardContent>
                {/* call the calculate-financial-health function or use earlier returned insights */}
                <div className="space-y-3">
                  <div className="p-4 border rounded bg-muted/20">High client concentration: Dial generates significant portion of revenue.</div>
                  <div className="p-4 border rounded bg-muted/20">Revenue trend: compare monthly trend to previous quarter for more details.</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Invoice Dialog */}
        <Dialog open={isEditInvoiceOpen} onOpenChange={setIsEditInvoiceOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
            </DialogHeader>
            {editingInvoice && (
              <>
                <div className="grid gap-3 py-4">
                  <label className="text-sm">Status</label>
                  <select value={editingInvoice.status} onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value as any })}>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>

                  <label className="text-sm">Notes</label>
                  <Input value={editingInvoice.notes} onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })} />
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditInvoiceOpen(false)}>Cancel</Button>
                  <Button onClick={async () => {
                    if (!editingInvoice) return;
                    // call update
                    try {
                      await onChangeInvoiceStatus(editingInvoice.id, editingInvoice.status);
                      // update notes via direct REST if required
                      await supabase.from("client_invoices").update({ notes: editingInvoice.notes }).eq("id", editingInvoice.id);
                      setIsEditInvoiceOpen(false);
                      toast({ title: "Saved" });
                    } catch (err: any) {
                      toast({ title: "Error", description: err.message, variant: "destructive" });
                    }
                  }}>Save</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
