import React, { useState, useEffect } from 'react';
import { getAnalyticsData } from '../../services/analyticsService';
import Alert from '../UI/Alert';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalyticsData();
      setAnalytics(data);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to load analytics data',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-2">Overview of all user requests and complaints</p>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            message={alert.message}
            onClose={() => setAlert(null)}
            dismissible
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Requests */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {analytics?.totalRequests || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {analytics?.completed || 0}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  {analytics?.completionRate || 0}%
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {analytics?.pending || 0}
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  {analytics?.pendingRate || 0}%
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {analytics?.inProgress || 0}
                </p>
                <p className="text-xs text-purple-600 mt-2">
                  {analytics?.inProgressRate || 0}%
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 2a1 1 0 01.894.553l1.962 3.923 4.328.632a1 1 0 01.554 1.705l-3.135 3.054.74 4.315a1 1 0 01-1.464 1.054L10 13.909l-3.879 2.04a1 1 0 01-1.464-1.055l.74-4.315L1.222 8.813a1 1 0 01.554-1.705l4.328-.632L11.106 2.553A1 1 0 0112 2z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Request Status Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Count</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Percentage</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{analytics?.completed || 0}</td>
                  <td className="px-6 py-4 text-slate-600">{analytics?.completionRate || 0}%</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${analytics?.completionRate || 0}%`}}></div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{analytics?.pending || 0}</td>
                  <td className="px-6 py-4 text-slate-600">{analytics?.pendingRate || 0}%</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${analytics?.pendingRate || 0}%`}}></div>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      In Progress
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{analytics?.inProgress || 0}</td>
                  <td className="px-6 py-4 text-slate-600">{analytics?.inProgressRate || 0}%</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: `${analytics?.inProgressRate || 0}%`}}></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
