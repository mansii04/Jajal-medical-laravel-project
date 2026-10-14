import React, { useEffect, useState } from 'react';
import { api } from '../api/client.ts';
import { DashboardStats, MedicalCase } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ActiveTab } from '../components/Navbar.tsx';
import { StatusBadge } from '../components/StatusBadge.tsx';
import { PriorityBadge } from '../components/PriorityBadge.tsx';
import {
  FolderKanban,
  Clock,
  Search,
  CheckCircle,
  FileCheck2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  RefreshCw,
  Database,
  ShieldCheck,
  Eye,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: ActiveTab, caseId?: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCases, setRecentCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      const [statsRes, casesRes] = await Promise.all([
        api.getDashboardStats(),
        api.getCases({ per_page: 5 }),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      } else {
        setError(statsRes.error || 'Failed to fetch dashboard metrics');
      }

      if (casesRes.data?.data) {
        setRecentCases(casesRes.data.data);
      }
    } catch {
      setError('Error loading dashboard statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Calculating dynamic metrics from database...</p>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Total Cases',
      count: stats?.total ?? 0,
      icon: FolderKanban,
      color: 'blue',
      bgLight: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      description: 'All registered surgical cases',
    },
    {
      label: 'Planning',
      count: stats?.planning ?? 0,
      icon: Clock,
      color: 'sky',
      bgLight: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-700',
      description: 'In initial surgical planning',
    },
    {
      label: 'In Review',
      count: stats?.in_review ?? 0,
      icon: Search,
      color: 'amber',
      bgLight: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      description: 'Under clinical & engineer review',
    },
    {
      label: 'Approved',
      count: stats?.approved ?? 0,
      icon: CheckCircle,
      color: 'emerald',
      bgLight: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      description: 'Approved for manufacture / OR',
    },
    {
      label: 'Completed',
      count: stats?.completed ?? 0,
      icon: FileCheck2,
      color: 'indigo',
      bgLight: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
      description: 'Successfully implanted & closed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & User Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Medical Case Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              <Database className="w-3 h-3" /> Live DB
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Logged in as <strong className="text-slate-800">{user?.name}</strong>{' '}
            ({isAdmin ? (
              <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Administrator
              </span>
            ) : (
              <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Read-Only Viewer
              </span>
            )}
            ). Real-time surgical implant pipeline statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              New Case
            </button>
          )}

          <button
            onClick={() => onNavigate('cases')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            View All Cases
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Required 5 Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`p-5 rounded-xl border ${item.border} ${item.bgLight} shadow-xs hover:shadow-md transition-shadow relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {item.label}
                </span>
                <div className={`p-2 rounded-lg bg-white/80 ${item.text} shadow-2xs`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {item.count}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics & High Priority Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              High Priority Cases
            </div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {stats?.high_priority ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Critical scheduling required</div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Upcoming Surgeries
            </div>
            <div className="text-2xl font-bold text-sky-600 mt-1">
              {stats?.upcoming_surgeries ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Scheduled in calendar</div>
          </div>
          <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pipeline Completion Rate
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats && stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Completed vs Total Cases</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Cases Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Medical Cases</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest additions to the implant tracking queue
            </p>
          </div>
          <button
            onClick={() => onNavigate('cases')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Explore all cases <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Case #</th>
                <th className="py-3 px-4">Patient Ref</th>
                <th className="py-3 px-4">Surgeon</th>
                <th className="py-3 px-4">Implant Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-blue-700">
                    {c.case_number}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{c.patient_reference}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{c.surgeon_name}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{c.implant_type}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate('details', c.id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
