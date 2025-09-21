// app/dashboard/analytics/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

import Breadcrumbs from "@/components/ui/Breadcrumbs";

// Time period selector component
const TimePeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '3m', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedPeriod === period.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

// Enhanced stat card with trend indicators
function StatCard({ title, value, previousValue, icon, color, subtitle, trend }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: 'text-green-500'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: 'text-purple-500'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      icon: 'text-orange-500'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      icon: 'text-red-500'
    }
  };

  const colors = colorMap[color] || colorMap.blue;
  const trendValue = previousValue ? ((value - previousValue) / previousValue * 100).toFixed(1) : 0;
  const isPositive = trendValue > 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colors.text}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <span className={`text-xl ${colors.icon}`}>{icon}</span>
        </div>
      </div>
      
      {previousValue && (
        <div className="mt-4 flex items-center gap-2">
          <div className={`flex items-center gap-1 text-sm ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414 6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {Math.abs(trendValue)}%
          </div>
          <span className="text-xs text-gray-500">vs previous period</span>
        </div>
      )}
    </div>
  );
}

// Loading skeleton component
const AnalyticsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
    <div className="grid lg:grid-cols-2 gap-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-80 bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// Error component
const AnalyticsError = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load analytics</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
    <button
      onClick={onRetry}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // ✅ FIXED: Use useCallback to memoize fetchData function
  const fetchData = useCallback(async (period = selectedPeriod) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]); // Only recreate when selectedPeriod changes

  // ✅ FIXED: Now fetchData won't cause infinite loops
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // No need to call fetchData here - it will be called automatically
    // when selectedPeriod changes due to the useCallback dependency
  };

  const handleRetry = () => {
    fetchData();
  };

  if (loading) return <AnalyticsSkeleton />;
  if (error) return <AnalyticsError error={error} onRetry={handleRetry} />;
  if (!data) return <AnalyticsError error="No analytics data available" onRetry={handleRetry} />;

  // Enhanced Chart Configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Views over time chart
  const viewsOverTimeData = {
    labels: data.viewsOverTime?.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
    datasets: [
      {
        label: 'Page Views',
        data: data.viewsOverTime?.map(item => item.views) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Most viewed posts
  const viewsData = {
    labels: (data.mostViewed || []).slice(0, 10).map(post => 
      post.title?.length > 30 ? post.title.substring(0, 30) + '...' : post.title || "Untitled"
    ),
    datasets: [
      {
        label: "Views",
        data: (data.mostViewed || []).slice(0, 10).map(post => post.views || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  // Most liked posts
  const likesData = {
    labels: (data.mostLiked || []).slice(0, 10).map(post => 
      post.title?.length > 30 ? post.title.substring(0, 30) + '...' : post.title || "Untitled"
    ),
    datasets: [
      {
        label: "Likes",
        data: (data.mostLiked || []).slice(0, 10).map(post =>
          Array.isArray(post.likes) ? post.likes.length : post.likes || 0
        ),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  // Content categories distribution
  const categoriesData = {
    labels: data.categoriesBreakdown?.map(cat => cat.name) || [],
    datasets: [
      {
        data: data.categoriesBreakdown?.map(cat => cat.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Analytics" },
            ]}
          />
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your content performance and audience engagement</p>
        </div>
        <TimePeriodSelector 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={handlePeriodChange} 
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Posts" 
          value={data.totalPosts || 0}
          previousValue={data.previousTotalPosts}
          icon="📝" 
          color="blue"
          subtitle="Published articles"
        />
        <StatCard 
          title="Total Views" 
          value={data.totalViews || 0}
          previousValue={data.previousTotalViews}
          icon="👁️" 
          color="green"
          subtitle="All-time page views"
        />
        <StatCard 
          title="Total Users" 
          value={data.totalUsers || 0}
          previousValue={data.previousTotalUsers}
          icon="👥" 
          color="purple"
          subtitle="Registered members"
        />
        <StatCard 
          title="Engagement Rate" 
          value={`${data.engagementRate || 0}%`}
          previousValue={data.previousEngagementRate}
          icon="💬" 
          color="orange"
          subtitle="Comments & likes"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Comments" 
          value={data.totalComments || 0}
          previousValue={data.previousTotalComments}
          icon="💬" 
          color="blue"
        />
        <StatCard 
          title="Total Likes" 
          value={data.totalLikes || 0}
          previousValue={data.previousTotalLikes}
          icon="❤️" 
          color="red"
        />
        <StatCard 
          title="Avg. Read Time" 
          value={`${data.avgReadTime || 0}m`}
          previousValue={data.previousAvgReadTime}
          icon="⏱️" 
          color="green"
        />
      </div>

      {/* Last Updated Info */}
      {data.updatedAt && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">
              Last updated: <span className="font-medium">{new Date(data.updatedAt).toLocaleString()}</span>
            </p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Views Over Time */}
        {data.viewsOverTime && (
          <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              📈 Views Over Time
            </h3>
            <div className="h-80">
              <Line data={viewsOverTimeData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Categories Distribution */}
        {data.categoriesBreakdown && (
          <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🥧 Content Categories
            </h3>
            <div className="h-80">
              <Doughnut data={categoriesData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  },
                },
              }} />
            </div>
          </div>
        )}

        {/* Most Viewed Posts */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔥 Most Viewed Posts
          </h3>
          <div className="h-80">
            <Bar data={viewsData} options={chartOptions} />
          </div>
        </div>

        {/* Most Liked Posts */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ❤️ Most Liked Posts
          </h3>
          <div className="h-80">
            <Bar data={likesData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Export Analytics</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            📊 Export as CSV
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            📄 Generate Report
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            📧 Email Summary
          </button>
        </div>
      </div>
    </div>
  );
}