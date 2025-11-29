import React, { useState, useEffect } from 'react';
import { usageTracker } from '../services/usageTracker';
import { BarChart3, Users, Zap, AlertCircle, Download, TrendingUp } from 'lucide-react';

export const UsageAnalytics: React.FC = () => {
  const [stats, setStats] = useState(usageTracker.getAllStats());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Refresh stats every 5 seconds
    const interval = setInterval(() => {
      setStats(usageTracker.getAllStats());
      setRefreshKey(prev => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const csv = usageTracker.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-analytics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const successRate = stats.total.generations > 0
    ? ((stats.total.successfulGenerations / stats.total.generations) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Usage Analytics</h1>
            <p className="text-slate-600">Monitor AI generation usage and costs</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-dark transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap size={20} className="text-blue-600" />
              </div>
              <h3 className="text-slate-600 font-medium">Total Generations</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.total.generations.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">All time</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <h3 className="text-slate-600 font-medium">Success Rate</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{successRate}%</p>
            <p className="text-sm text-slate-500 mt-1">
              {stats.total.successfulGenerations} / {stats.total.generations}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users size={20} className="text-purple-600" />
              </div>
              <h3 className="text-slate-600 font-medium">Unique Users</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.total.uniqueUsers}</p>
            <p className="text-sm text-slate-500 mt-1">Using the service</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <h3 className="text-slate-600 font-medium">Failed Requests</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.total.failedGenerations}</p>
            <p className="text-sm text-slate-500 mt-1">Need attention</p>
          </div>
        </div>

        {/* Time-based Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">Today</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Generations:</span>
                <span className="font-semibold text-slate-900">{stats.today.generations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Successful:</span>
                <span className="font-semibold text-green-600">{stats.today.successfulGenerations}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">This Week</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Generations:</span>
                <span className="font-semibold text-slate-900">{stats.weekly.generations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Successful:</span>
                <span className="font-semibold text-green-600">{stats.weekly.successfulGenerations}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4">This Month</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Generations:</span>
                <span className="font-semibold text-slate-900">{stats.monthly.generations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Successful:</span>
                <span className="font-semibold text-green-600">{stats.monthly.successfulGenerations}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-8">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-brand-blue" />
            Estimated Costs (if using paid tier)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Tokens</p>
              <p className="text-2xl font-bold text-slate-900">
                {(stats.total.inputTokens + stats.total.outputTokens).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Input: {stats.total.inputTokens.toLocaleString()} | Output: {stats.total.outputTokens.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Estimated Cost</p>
              <p className="text-2xl font-bold text-green-600">
                ${((stats.total.inputTokens * 0.075 / 1000000) + (stats.total.outputTokens * 0.30 / 1000000)).toFixed(4)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Based on Gemini Flash pricing</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Cost per Generation</p>
              <p className="text-2xl font-bold text-slate-900">
                ${stats.total.generations > 0
                  ? (((stats.total.inputTokens * 0.075 / 1000000) + (stats.total.outputTokens * 0.30 / 1000000)) / stats.total.generations).toFixed(6)
                  : '0.000000'
                }
              </p>
              <p className="text-xs text-slate-500 mt-1">Average per request</p>
            </div>
          </div>
        </div>

        {/* Error Breakdown */}
        {Object.keys(stats.errorBreakdown).length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-600" />
              Error Breakdown
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.errorBreakdown).map(([errorType, count]) => (
                <div key={errorType} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700 capitalize">{errorType.replace(/_/g, ' ')}</span>
                  <span className="font-semibold text-red-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Auto-refreshing every 5 seconds • Last update: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
