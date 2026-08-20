'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, BarChart2, Users, Activity } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils';

type AdminStats = {
  actionCounts: { _id: string; count: number }[];
  dailyActive: { _id: string; uniqueUsersCount: number }[];
  recentLogs: {
    _id: string;
    user: { id: string; name: string; email: string } | null;
    action: string;
    details: any;
    timestamp: string;
  }[];
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No auth token found');

        const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Access denied. Admin only.');
        }

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading admin statistics...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="h-6 w-6 text-emerald-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Counts */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" /> Action Summary
          </h2>
          <div className="space-y-3">
            {stats.actionCounts.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium capitalize">{item._id.replace(/_/g, ' ')}</span>
                <span className="text-sm font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md">{item.count}</span>
              </div>
            ))}
            {stats.actionCounts.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No actions recorded</p>}
          </div>
        </div>

        {/* Daily Active Users */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-500" /> Daily Active Users
          </h2>
          <div className="space-y-3">
            {stats.dailyActive.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/5">
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{new Date(item._id).toLocaleDateString()}</span>
                <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{item.uniqueUsersCount} users</span>
              </div>
            ))}
            {stats.dailyActive.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No activity recorded</p>}
          </div>
        </div>
      </div>

      {/* Recent Activity Logs */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-orange-500" /> Recent Activity Logs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLogs.map((log) => (
                <tr key={log._id} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">{log.user?.name || 'Unknown User'}</span>
                      <span className="text-[10px] text-gray-500">{log.user?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recentLogs.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-6">No recent logs</p>
          )}
        </div>
      </div>
    </div>
  );
}
