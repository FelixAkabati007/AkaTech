import React, { useCallback, useEffect, useState } from "react";
import { Icons } from "@components/ui/Icons";
import { Card } from "@components/ui/Card";
import { useSyncStatus } from "@components/ui/SyncStatusProvider";
import { useToast } from "@components/ui/ToastProvider";

const initialStats = {
  totalUsers: 0,
  activeProjects: 0,
  totalRevenue: 0,
  outstandingRevenue: 0,
  pendingTickets: 0,
};

const formatTime = (date) =>
  date ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date) : "Not yet";

const formatActivity = (log) => {
  const action = String(log.action || log.event || "Activity recorded").replace(/[_-]/g, " ");
  const actor = log.userName || log.userEmail || log.actor || "System";
  return `${action.charAt(0).toUpperCase()}${action.slice(1)} by ${actor}`;
};

export const AdminDashboard = () => {
  const { addToast } = useToast();
  const { socket } = useSyncStatus();
  const [stats, setStats] = useState(initialStats);
  const [health, setHealth] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [statsResponse, healthResponse, activityResponse] = await Promise.all([
        fetch("/api/admin/stats", { credentials: "include" }),
        fetch("/api/admin/system-health", { credentials: "include" }),
        fetch("/api/admin/audit-logs", { credentials: "include" }),
      ]);
      if (![statsResponse, healthResponse, activityResponse].every((response) => response.ok)) {
        throw new Error("One or more dashboard services failed");
      }
      const [nextStats, nextHealth, nextActivity] = await Promise.all([
        statsResponse.json(),
        healthResponse.json(),
        activityResponse.json(),
      ]);
      setStats({ ...initialStats, ...nextStats });
      setHealth(nextHealth);
      setActivity(Array.isArray(nextActivity) ? nextActivity.slice(0, 5) : []);
      setError("");
      setLastUpdated(new Date());
    } catch (dashboardError) {
      console.error("Dashboard fetch failed", dashboardError);
      setError("Dashboard data is temporarily unavailable.");
      addToast("Failed to refresh dashboard data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboard();
    const interval = window.setInterval(() => fetchDashboard(), 30000);
    const events = ["dashboard_update", "invoice_generated", "invoice_created", "invoice_updated", "invoice_paid", "new_user", "user_registered"];
    events.forEach((event) => socket?.on(event, fetchDashboard));
    return () => {
      window.clearInterval(interval);
      events.forEach((event) => socket?.off(event, fetchDashboard));
    };
  }, [fetchDashboard, socket]);

  const statCards = [
    ["Total Users", stats.totalUsers, Icons.Users, "+12%"],
    ["Active Projects", stats.activeProjects, Icons.Briefcase, "+5%"],
    ["Total Revenue", `GH₵ ${Number(stats.totalRevenue || 0).toLocaleString()}`, Icons.CreditCard, "+24%"],
    ["Outstanding", `GH₵ ${Number(stats.outstandingRevenue || 0).toLocaleString()}`, Icons.Clock, "Due"],
    ["Pending Tickets", stats.pendingTickets, Icons.LifeBuoy, "Review"],
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-akatech-gold">Operations overview</p>
          <h2 className="mt-2 text-3xl font-serif text-gray-900 dark:text-white">Admin Dashboard</h2>
          <p className="mt-2 text-sm text-gray-500">Live data from clients, projects, billing, support, and Neon.</p>
        </div>
        <button onClick={() => fetchDashboard(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-akatech-gold hover:text-akatech-gold disabled:opacity-50">
          <Icons.RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing" : "Refresh data"}
        </button>
      </div>

      {error && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(([label, value, Icon, change]) => (
          <Card key={label} hoverEffect glass={false} className="bg-white dark:bg-akatech-card">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs uppercase tracking-widest text-gray-500">{label}</span>
              <div className="rounded-lg bg-akatech-gold/10 p-2 text-akatech-gold"><Icon className="w-5 h-5" /></div>
            </div>
            <div className="mt-5 flex items-end justify-between gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? "—" : value}</span>
              <span className="text-xs font-semibold text-akatech-gold">{change}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card glass={false} className="bg-white dark:bg-akatech-card">
          <div className="flex items-center justify-between gap-4">
            <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent activity</h3><p className="mt-1 text-sm text-gray-500">Latest audit events across the workspace.</p></div>
            <span className="text-xs text-gray-500">Updated {formatTime(lastUpdated)}</span>
          </div>
          <div className="mt-6 flex flex-col gap-5">
            {loading ? <p className="text-sm text-gray-500">Loading activity…</p> : activity.length ? activity.map((log, index) => <div key={log.id || `${log.createdAt}-${index}`} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-akatech-gold" /><div><p className="text-sm font-medium text-gray-900 dark:text-white">{formatActivity(log)}</p><p className="mt-1 text-xs text-gray-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "Recently"}</p></div></div>) : <p className="text-sm text-gray-500">No audit activity has been recorded yet.</p>}
          </div>
        </Card>

        <Card glass={false} className="bg-white dark:bg-akatech-card">
          <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-bold text-gray-900 dark:text-white">System health</h3><p className="mt-1 text-sm text-gray-500">Live service and database telemetry.</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${health?.database?.status === "healthy" || health?.database?.status === "connected" ? "bg-green-500/10 text-green-500" : "bg-akatech-gold/10 text-akatech-gold"}`}>{health ? "Operational" : "Checking"}</span></div>
          <div className="mt-6 flex flex-col gap-5">
            {[['Server load', health?.server?.load, '%'], ['Memory usage', health?.server?.memory, '%'], ['Database latency', health?.database?.latency, ' ms']].map(([label, value, suffix]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-bold text-akatech-gold">{value == null ? "—" : `${value}${suffix}`}</span></div>{suffix !== ' ms' && <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"><div className="h-full rounded-full bg-akatech-gold transition-all" style={{ width: `${Math.min(Number(value) || 0, 100)}%` }} /></div>}</div>)}
            <div className="border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-white/10">{health?.server?.uptime ? `Server uptime: ${Math.floor(health.server.uptime / 3600)}h ${Math.floor((health.server.uptime % 3600) / 60)}m` : "Waiting for server telemetry"}</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
