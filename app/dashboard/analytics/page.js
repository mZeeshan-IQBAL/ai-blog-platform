// app/dashboard/analytics/page.js
"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p>No analytics available.</p>;

  // Chart Data
  const viewsData = {
    labels: (data.mostViewed || []).map((post) => post.title || "Untitled"),
    datasets: [{
      label: "Views",
      data: (data.mostViewed || []).map((post) => post.views || 0),
      backgroundColor: "rgba(59, 130, 246, 0.5)",
    }]
  };

  const likesData = {
    labels: (data.mostLiked || []).map((post) => post.title || "Untitled"),
    datasets: [{
      label: "Likes",
      data: (data.mostLiked || []).map((post) =>
        Array.isArray(post.likes) ? post.likes.length : post.likes || 0
      ),
      backgroundColor: "rgba(239, 68, 68, 0.5)",
    }]
  };

  return (
    <div>
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }]} />
      </div>
      <h2 className="text-3xl font-bold mb-6">Analytics Dashboard</h2>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <StatCard title="Total Posts" value={data.totalPosts || 0} color="blue" />
        <StatCard title="Total Users" value={data.totalUsers || 0} color="green" />
        <StatCard title="Total Comments" value={data.totalComments || 0} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Most Viewed Posts</h3>
          <Bar data={viewsData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Most Liked Posts</h3>
          <Bar data={likesData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}

// Sub-component for stat cards
function StatCard({ title, value, color }) {
  const map = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <div className={`p-6 rounded shadow ${map[color]}`}>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}