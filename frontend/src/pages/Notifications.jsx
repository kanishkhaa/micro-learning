import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.log(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    try {
      await API.post("/notifications/read-all");
      await load();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🔔 Notifications
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Stay up to date when admins respond, your posts get replies, or
                requested content is added.
              </p>
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                type="button"
                onClick={markAllRead}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {loading && (
              <div className="p-4 text-xs text-gray-400">Loading…</div>
            )}
            {!loading && notifications.length === 0 && (
              <div className="p-4 text-xs text-gray-500">
                No notifications yet.
              </div>
            )}
            {!loading &&
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-gray-100 text-sm flex items-start gap-3 ${
                    !n.isRead ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <span className="mt-0.5 text-lg">
                    {n.type === "support"
                      ? "🛟"
                      : n.type === "forum"
                      ? "💬"
                      : "📝"}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm whitespace-pre-wrap">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;

