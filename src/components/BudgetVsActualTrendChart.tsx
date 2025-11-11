
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

// Types for the chart component
type DataPoint = {
  month: string;
  budgetRevenue?: number;
  actualRevenue?: number;
  projectedRevenue?: number;
  budgetCost?: number;
  actualCost?: number;
  projectedCost?: number;
};

type Department = "All Departments" | "Maintenance" | "Development" | "Social" | "Performance";

type BudgetVsActualTrendChartProps = {
  title?: string;
  description?: string;
  className?: string;
  height?: number | string;
  showDepartmentFilter?: boolean;
  chartType?: "line" | "bar";
};

// Sample data for development
// In production, this would come from API calls or props
const generateSampleData = (department: Department): DataPoint[] => {
  // Financial year: April - March
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const currentMonth = new Date().getMonth();
  // Adjust for financial year (April = 0, March = 11)
  const financialYearMonth = (currentMonth - 3 + 12) % 12;
  
  // Multipliers for different departments
  const multipliers: Record<Department, number> = {
    "All Departments": 1,
    "Maintenance": 0.7,
    "Development": 1.2,
    "Social": 0.5,
    "Performance": 0.8
  };
  
  const multiplier = multipliers[department] || 1;

  return months.map((month, index) => {
    // Past and current months have actual data, future months have projections
    const isPastOrCurrent = index <= financialYearMonth;
    const isFuture = index > financialYearMonth;
    
    // Base values that will be adjusted by department
    const baseRevenue = 500000 + Math.random() * 100000;
    const baseCost = 300000 + Math.random() * 80000;
    
    // Create variance between budget and actual
    const varianceMultiplier = 0.8 + Math.random() * 0.4; // 80% to 120% of budget
    
    const dataPoint: DataPoint = {
      month,
    };
    
    // Budget is always there for all months
    dataPoint.budgetRevenue = Math.round(baseRevenue * multiplier);
    dataPoint.budgetCost = Math.round(baseCost * multiplier);
    
    // For past and current months, we have actual data
    if (isPastOrCurrent) {
      dataPoint.actualRevenue = Math.round(dataPoint.budgetRevenue * varianceMultiplier);
      dataPoint.actualCost = Math.round(dataPoint.budgetCost * varianceMultiplier);
    }
    
    // For future months, we have projections
    if (isFuture) {
      // Projections based on opportunities and employee costs
      dataPoint.projectedRevenue = Math.round(dataPoint.budgetRevenue * (0.9 + Math.random() * 0.3));
      dataPoint.projectedCost = Math.round(dataPoint.budgetCost * (0.95 + Math.random() * 0.1));
    }
    
    return dataPoint;
  });
};

const BudgetVsActualTrendChart = ({
  title = "Budget vs Actual Trend",
  description = "Monthly comparison of budget vs actual with future projections",
  className = "",
  height = 400,
  showDepartmentFilter = true,
  chartType = "line"
}: BudgetVsActualTrendChartProps) => {
  const [department, setDepartment] = useState<Department>("All Departments");
  const [dataType, setDataType] = useState<"revenue" | "cost">("revenue");
  
  const data = generateSampleData(department);
  
  // Format currency as Indian Rupees
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format y-axis tick labels
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };
  
  // Get current month to draw reference line
  const currentMonth = new Date().getMonth();
  const financialYearMonth = (currentMonth - 3 + 12) % 12; // Adjusting for April-March financial year
  const currentMonthName = data[financialYearMonth]?.month;
  
  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 pt-2">
        <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
          {showDepartmentFilter && (
            <Select value={department} onValueChange={(value) => setDepartment(value as Department)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Departments">All Departments</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Social">Social</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={dataType} onValueChange={(value) => setDataType(value as "revenue" | "cost")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Data Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div style={{ height: height, width: '100%' }}>
        <ChartContainer
          config={{
            budget: {
              label: "Budget",
              theme: {
                light: "#0ea5e9",
                dark: "#0ea5e9"
              }
            },
            actual: {
              label: "Actual",
              theme: {
                light: "#22c55e",
                dark: "#22c55e"
              }
            },
            projected: {
              label: "Projected",
              theme: {
                light: "#f59e0b",
                dark: "#f59e0b"
              }
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatYAxis} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  }
                />
                <Legend />
                
                {dataType === "revenue" ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="budgetRevenue"
                      name="Budget"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualRevenue"
                      name="Actual"
                      stroke="#22c55e" 
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedRevenue"
                      name="Projected"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="budgetCost"
                      name="Budget"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualCost"
                      name="Actual"
                      stroke="#22c55e"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="projectedCost"
                      name="Projected"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </>
                )}
                
                {/* Reference line for current month */}
                <ReferenceLine
                  x={currentMonthName}
                  stroke="#ef4444"
                  label={{ value: "Current", position: "insideTopRight", fill: "#ef4444" }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatYAxis} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value: any) => formatCurrency(value)}
                    />
                  }
                />
                <Legend />
                
                {dataType === "revenue" ? (
                  <>
                    <Bar
                      dataKey="budgetRevenue"
                      name="Budget"
                      fill="#0ea5e9"
                      fillOpacity={0.8}
                      barSize={18}
                    />
                    <Bar
                      dataKey="actualRevenue"
                      name="Actual"
                      fill="#22c55e" 
                      fillOpacity={0.8}
                      barSize={18}
                    />
                    <Bar
                      dataKey="projectedRevenue"
                      name="Projected"
                      fill="#f59e0b"
                      fillOpacity={0.8}
                      barSize={18}
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  </>
                ) : (
                  <>
                    <Bar
                      dataKey="budgetCost"
                      name="Budget"
                      fill="#0ea5e9"
                      fillOpacity={0.8}
                      barSize={18}
                    />
                    <Bar
                      dataKey="actualCost"
                      name="Actual"
                      fill="#22c55e"
                      fillOpacity={0.8}
                      barSize={18}
                    />
                    <Bar
                      dataKey="projectedCost"
                      name="Projected"
                      fill="#f59e0b"
                      fillOpacity={0.8}
                      barSize={18}
                      stroke="#f59e0b"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  </>
                )}
                
                {/* Reference line for current month */}
                <ReferenceLine
                  x={currentMonthName}
                  stroke="#ef4444"
                  label={{ value: "Current", position: "insideTopRight", fill: "#ef4444" }}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default BudgetVsActualTrendChart;
