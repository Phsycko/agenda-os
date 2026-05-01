"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartPoint = {
  name?: string;
  month?: string;
  value: number;
};

export function DashboardCharts({
  bySource,
  incomeData,
}: {
  bySource: ChartPoint[];
  incomeData: ChartPoint[];
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-4 mb-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Leads por fuente</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySource}>
              <CartesianGrid stroke="#222" />
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
          <CardTitle>Ingresos por mes</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={incomeData}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#00E676" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
