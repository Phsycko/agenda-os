"use client";

import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#00C853", "#00E676", "#ffc107", "#ef4444", "#60a5fa"];

type Point = { name?: string; month?: string; value: number };

export function ReportsCharts({
  bySource,
  byStage,
  byMonth,
}: {
  bySource: Point[];
  byStage: Point[];
  byMonth: Point[];
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Leads por fuente</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySource}>
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Bar dataKey="value" fill="#00C853" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Estados de leads</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byStage} dataKey="value" nameKey="name" outerRadius={95}>
                {byStage.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader>
          <CardTitle>Ingresos mensuales</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byMonth}>
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Line dataKey="value" stroke="#00E676" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
