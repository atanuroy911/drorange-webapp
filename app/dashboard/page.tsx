"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

const data = [
  { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
  { name: "Page B", uv: 300, pv: 1398, amt: 2210 },
  { name: "Page C", uv: 200, pv: 9800, amt: 2290 },
];



function ChartCard({ index }: { index: number }) {
  return (
    <Card className="p-4 shadow rounded-2xl">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold">Chart {index + 1}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><QrCode className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="uv" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default function DashboardPage() {
  const [charts, setCharts] = useState([0, 1, 2, 3]);

  const loadMore = () => {
    const nextCharts = Array.from({ length: 4 }, (_, i) => i + charts.length);
    setCharts((prev) => [...prev, ...nextCharts]);
    toast.success("More charts loaded");
  };

  const router = useRouter();


const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        toast.error("Failed to logout");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-6 py-4 shadow bg-white">
        <div className="text-xl font-bold text-blue-700">🧃 Dr. Orange Dashboard</div>
        <div className="flex gap-4">
          <Button variant="outline">See Analysis</Button>
          <Button variant="outline">Download CSV</Button>
          <Button variant="outline">Download Report</Button>
          <Button onClick={handleLogout} variant="destructive">
        Logout
      </Button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {charts.map((chartIndex) => (
          <ChartCard key={chartIndex} index={chartIndex} />
        ))}
      </main>

      <div className="flex justify-center py-6">
        <Button onClick={loadMore}>Load More</Button>
      </div>
    </div>
  );
}
