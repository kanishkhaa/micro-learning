import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.get("/admin/analytics");
        setStats(res.data);
      } catch (err) {
        console.log(err);
        setError("You must be an admin to view analytics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🛠️ Admin Analytics
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              High-level overview of users, content, and activity.
            </p>
          </div>

          {loading && (
            <p className="text-sm text-gray-400">Loading analytics…</p>
          )}
          {error && !loading && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {stats && !loading && !error && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Total Bites</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalBites}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Forum Posts</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalForumPosts}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Content Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalContentRequests}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Active Users (7d)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeUsers}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;

