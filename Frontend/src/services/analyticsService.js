import { apiFetch } from '../api';

export const getAnalyticsData = async () => {
  const response = await apiFetch('/forts/analytics/');
  if (!response.ok) throw new Error('Failed to fetch analytics data');
  const data = await response.json();
  return data;
};

export const getRequestsByStatus = async () => {
  const response = await apiFetch('/admin-reports/?page_size=1000');
  if (!response.ok) throw new Error('Failed to fetch reports by status');
  const data = await response.json();
  return data;
};

export const getCompletionStats = async () => {
  const response = await apiFetch('/forts/statistics/');
  if (!response.ok) throw new Error('Failed to fetch completion stats');
  const data = await response.json();
  return data;
};

export default {
  getAnalyticsData,
  getRequestsByStatus,
  getCompletionStats,
};
