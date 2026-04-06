import React, { useState, useEffect } from 'react';
import { getUserAnalytics } from '../../services/analyticsService';
import Alert from '../UI/Alert';

export const UserAnalytics = () => {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getUserAnalytics();
      setUserStats(data);
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to load your analytics',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600 text-sm">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => setAlert(null)}
          dismissible
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-600">
          <p className="text-slate-600 text-sm font-medium">Total Requests</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{userStats?.totalRequests || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-l-4 border-green-600">
          <p className="text-slate-600 text-sm font-medium">Resolved</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{userStats?.resolved || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-l-4 border-yellow-600">
          <p className="text-slate-600 text-sm font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{userStats?.pending || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-600">
          <p className="text-slate-600 text-sm font-medium">In Review</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{userStats?.inReview || 0}</p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Your Request Progress</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Resolved</span>
              <span className="text-sm font-semibold text-green-600">{userStats?.resolvedPercent || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: `${userStats?.resolvedPercent || 0}%`}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">In Review</span>
              <span className="text-sm font-semibold text-purple-600">{userStats?.inReviewPercent || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: `${userStats?.inReviewPercent || 0}%`}}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Pending</span>
              <span className="text-sm font-semibold text-yellow-600">{userStats?.pendingPercent || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${userStats?.pendingPercent || 0}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests Summary */}
      {userStats?.recentRequests && userStats.recentRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Requests</h3>
          <div className="space-y-2">
            {userStats.recentRequests.map((request, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{request.title}</p>
                  <p className="text-xs text-slate-500">{request.submittedDate}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  request.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                  request.status === 'In Review' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAnalytics;
