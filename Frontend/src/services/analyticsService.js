import axios from 'axios';

const API_URL = 'http://localhost:5000/api/analytics';

export const getAnalyticsData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getRequestsByStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/requests-by-status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const getCompletionStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/completion-stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getAnalyticsData,
  getRequestsByStatus,
  getCompletionStats,
};
