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

  // Loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error alert
  if (error) {
    return (
      <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100" role="alert">
        {error}
      </div>
    );
  }

  if (!data) return <p>No analytics available.</p>;

  // Chart Data
  const viewsData = {
    labels: (data.mostViewed || []).map((post) => post.title || "Untitled"),
    datasets: [
      {
        label: "Views",
        data: (data.mostViewed || []).map((post) => post.views || 0),
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const likesData = {
    labels: (data.mostLiked || []).map((post) => post.title || "Untitled"),
    datasets: [
      {
        label: "Likes",
        data: (data.mostLiked || []).map((post) =>
          Array.isArray(post.likes) ? post.likes.length : post.likes || 0
        ),
        backgroundColor: "rgba(239, 68, 68, 0.5)",
      },
    ],
  };

  return (
    <div>
      <div className="mb-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Analytics" },
          ]}
        />
      </div>
      <h2 className="text-3xl font-bold mb-6">Analytics Dashboard</h2>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <StatCard title="Total Posts" value={data.totalPosts || 0} color="blue" />
        <StatCard title="Total Users" value={data.totalUsers || 0} color="green" />
        <StatCard title="Total Comments" value={data.totalComments || 0} color="purple" />
      </div>

      {/* Optional: last updated */}
      {data.updatedAt && (
        <p className="text-sm text-gray-500 mb-6">
          Last updated: {new Date(data.updatedAt).toLocaleString()}
        </p>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Most Viewed Posts</h3>
          <div className="h-80">
            <Bar data={viewsData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Most Liked Posts</h3>
          <div className="h-80">
            <Bar data={likesData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for stat cards
function StatCard({ title, value, color }) {
  const map = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  return (
    <div className="p-6 rounded shadow bg-white">
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className={`text-2xl font-bold ${map[color]}`}>{value}</p>
    </div>
  );
}
