import React from 'react';
import UserReportAnalysis from '../../admin/UserReportAnalysis';
import AdminNavbar from '../../admin/AdminNavbar';

export const AdminAnalytics = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <div className="flex-1 w-full">
        {/* The UserReportAnalysis component handles its own data fetching and layout */}
        <UserReportAnalysis embedded={false} />
      </div>
    </div>
  );
};

export default AdminAnalytics;
