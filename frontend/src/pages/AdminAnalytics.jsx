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

  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const activityLine = stats?.activityLine || [];
  const quizPerformance = stats?.quizPerformance || [];

  const maxLogin = Math.max(
    1,
    ...activityLine.map((d) => d.logins || 0),
    ...activityLine.map((d) => d.completedBites || 0)
  );
  const maxQuizAttempts = Math.max(
    1,
    ...quizPerformance.map((q) => q.attempts || 0)
  );

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotifLoading(true);
        const res = await API.get("/notifications");
        setNotifications(res.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setNotifLoading(false);
      }
    };
    loadNotifications();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-white text-gray-900">
        <div className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300 text-xl">
                  🛠️
                </span>
                <span>Admin Control Center</span>
              </h2>
              <p className="text-xs lg:text-sm text-gray-500 mt-1">
                Monitor learners, content, and quiz performance in real time.
              </p>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-gray-500">Loading analytics…</p>
          )}
          {error && !loading && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {stats && !loading && !error && (
            <>
              {/* Top metric cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <p className="text-xs text-gray-500">Total Users</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <p className="text-xs text-gray-500">Active Users (Today)</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">
                    {stats.activeUsersToday}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <p className="text-xs text-gray-500">Active Users (7 days)</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">
                    {stats.activeUsersWeek}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <p className="text-xs text-gray-500">Total Bites</p>
                  <p className="mt-2 text-2xl font-bold text-sky-300">
                    {stats.totalBites}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <p className="text-xs text-gray-500">Total Quiz Attempts</p>
                  <p className="mt-2 text-2xl font-bold text-indigo-300">
                    {stats.totalQuizAttempts}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <p className="text-xs text-gray-500">Forum Posts</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {stats.totalForumPosts}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Replies:{" "}
                    <span className="font-semibold">
                      {stats.totalForumReplies}
                    </span>
                  </p>
                </div>
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <p className="text-xs text-gray-500">Content Requests</p>
                  <p className="mt-2 text-2xl font-bold text-amber-300">
                    {stats.totalContentRequests}
                  </p>
                </div>
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <p className="text-xs text-gray-500">Support Queries</p>
                  <p className="mt-2 text-2xl font-bold text-rose-300">
                    {stats.totalSupportTickets}
                  </p>
                </div>
              </div>

              {/* Charts + notifications row */}
              <div className="grid xl:grid-cols-[2fr,2fr,1.4fr] lg:grid-cols-2 gap-6">
                {/* Line chart: user activity */}
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        User Activity (7 days)
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Logins vs modules completed per day
                      </p>
                    </div>
                  </div>
                  {activityLine.length === 0 ? (
                    <p className="text-xs text-gray-500">No activity data.</p>
                  ) : (
                    <div className="h-48 relative">
                      <svg
                        viewBox="0 0 100 40"
                        className="w-full h-full text-slate-200"
                      >
                        {/* Grid lines */}
                        {[0, 10, 20, 30, 40].map((y) => (
                          <line
                            // eslint-disable-next-line react/no-array-index-key
                            key={y}
                            x1="0"
                            x2="100"
                            y1={40 - y}
                            y2={40 - y}
                            stroke="rgba(148, 163, 184, 0.2)"
                            strokeWidth="0.2"
                          />
                        ))}
                        {/* Logins line */}
                        <polyline
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          points={activityLine
                            .map((d, idx) => {
                              const x =
                                (idx / Math.max(activityLine.length - 1, 1)) *
                                100;
                              const y =
                                35 -
                                ((d.logins || 0) / maxLogin) * 25;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                        />
                        {/* Completed bites line */}
                        <polyline
                          fill="none"
                          stroke="#a855f7"
                          strokeWidth="1.5"
                          points={activityLine
                            .map((d, idx) => {
                              const x =
                                (idx / Math.max(activityLine.length - 1, 1)) *
                                100;
                              const y =
                                35 -
                                ((d.completedBites || 0) / maxLogin) * 25;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                        />
                      </svg>
                      <div className="mt-2 flex justify-between text-[10px] text-gray-500">
                        {activityLine.map((d) => (
                          <span key={d.date}>
                            {new Date(d.date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-3 text-[10px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-sky-400" />
                          Logins
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-purple-400" />
                          Completed bites
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bar chart: quiz performance */}
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Quiz Performance
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Attempts per quiz (avg score shown below)
                      </p>
                    </div>
                  </div>
                  {quizPerformance.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      No quiz attempts data yet.
                    </p>
                  ) : (
                    <div className="h-48 flex items-end gap-2">
                      {quizPerformance.map((q) => {
                        const height =
                          ((q.attempts || 0) / maxQuizAttempts) * 100 || 4;
                        return (
                          <div
                            key={q.topicId}
                            className="flex-1 flex flex-col items-center justify-end gap-1"
                          >
                            <div
                              className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-sky-400"
                              style={{
                                height: `${Math.max(height, 15)}%`,
                              }}
                            />
                            <span className="text-[10px] text-gray-600 text-center line-clamp-2">
                              {q.topicName}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {q.attempts}× ·{" "}
                              {q.avgScore != null ? `${q.avgScore}%` : "-"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Admin notifications panel */}
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Admin Notifications
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Latest support and content events.
                      </p>
                    </div>
                  </div>
                  <div className="h-48 overflow-y-auto text-sm">
                    {notifLoading && (
                      <p className="text-xs text-gray-500">Loading…</p>
                    )}
                    {!notifLoading && notifications.length === 0 && (
                      <p className="text-xs text-gray-500">
                        No notifications yet.
                      </p>
                    )}
                    {!notifLoading &&
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`px-3 py-2 mb-1 rounded-xl border text-xs ${
                            !n.isRead
                              ? "bg-blue-50 border-blue-100"
                              : "bg-gray-50 border-gray-100"
                          }`}
                        >
                          <p className="font-medium text-gray-800">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Most viewed bites */}
              <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-4 shadow-lg shadow-slate-900/30">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Most Engaged Bites
                </p>
                {(!stats.mostViewedBites ||
                  stats.mostViewedBites.length === 0) && (
                  <p className="text-xs text-gray-500">
                    No completion data yet.
                  </p>
                )}
                {stats.mostViewedBites && stats.mostViewedBites.length > 0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                   {stats.mostViewedBites.map((b) => (
  <div
    key={b.topicId}
    className="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm"
  >
    <p className="text-xs text-gray-500 mb-1">
      {b.count} completions
    </p>
    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
      {b.name}
    </p>
  </div>
))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;


