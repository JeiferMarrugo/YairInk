"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/display";
import type {
  AppointmentTrendPoint,
  RevenueTrendPoint,
} from "@/types/admin-dashboard";

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid rgba(0,0,0,0.1)",
  borderRadius: 0,
  fontSize: 12,
};

export function AppointmentTrendsChart({
  data,
}: {
  data: AppointmentTrendPoint[];
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#999" }}
            axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#999" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
            formatter={(value) =>
              value === "consultations" ? "Consultas" : "Sesiones"
            }
          />
          <Bar
            dataKey="consultations"
            name="consultations"
            fill="#000000"
            radius={[2, 2, 0, 0]}
            maxBarSize={28}
          />
          <Bar
            dataKey="sessions"
            name="sessions"
            fill="#e8e0d4"
            stroke="#000"
            strokeWidth={1}
            radius={[2, 2, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueAreaChart({ data }: { data: RevenueTrendPoint[] }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 10, fill: "#999" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#999" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              `${Math.round(Number(value) / 1000)}k`
            }
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [
              formatCurrency(Number(value)),
              "Ingresos",
            ]}
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="#000"
            strokeWidth={2}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
