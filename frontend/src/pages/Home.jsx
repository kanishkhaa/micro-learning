import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";
import ProgressCard from "../components/ProgressCard";

const Home = () => {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(localUser);
  const [summary, setSummary] = useState({
    total: 0,
    completed: 0,
    avgMinutes: 0,
    loading: true,
  });
  const [recentTopic, setRecentTopic] = useState(null);
  const [recommendedTopic, setRecommendedTopic] = useState(null);
  const [sections, setSections] = useState([]);
  const [recent, setRecent] = useState([]);
  const [activeDays, setActiveDays] = useState(0);
  const [dailySeries, setDailySeries] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, progressRes, meRes] = await Promise.all([
          API.get("/topics"),
          API.get("/progress"),
          API.get("/auth/me"),
        ]);

        const topics = topicsRes.data || [];
        const progress = progressRes.data || [];

        const completedTopicIds = new Set(
          progress
            .filter((p) => p.completedAt)
            .map((p) =>
              p.topicId && p.topicId._id ? p.topicId._id : p.topicId
            )
            .filter(Boolean)
        );

        const total = topics.length;
        const completed = topics.filter((t) =>
          completedTopicIds.has(t._id)
        ).length;

        const durations = progress
          .filter((p) => p.startedAt && p.completedAt)
          .map(
            (p) =>
              new Date(p.completedAt).getTime() -
              new Date(p.startedAt).getTime()
          )
          .filter((ms) => ms > 0);

        const totalMs = durations.reduce((sum, v) => sum + v, 0);
        const avgMinutes =
          durations.length > 0
            ? Math.round(totalMs / durations.length / 60000)
            : 0;

        setSummary({
          total,
          completed,
          avgMinutes,
          loading: false,
        });

        // Build "Continue Learning" and "Recommended"
        let recentTopicObj = null;
        let recommended = null;

        if (topics.length > 0 && progress.length > 0) {
          const progressSorted = [...progress].sort((a, b) => {
            const aTime = new Date(a.completedAt || a.startedAt || 0).getTime();
            const bTime = new Date(b.completedAt || b.startedAt || 0).getTime();
            return bTime - aTime;
          });

          const recentProgress = progressSorted[0];
          if (recentProgress) {
            const recentId =
              recentProgress.topicId?._id || recentProgress.topicId;
            recentTopicObj = topics.find((t) => t._id === recentId) || null;
            setRecentTopic(recentTopicObj);

            if (recentTopicObj) {
              const sameTrack = topics
                .filter(
                  (t) =>
                    t.mainCategory === recentTopicObj.mainCategory &&
                    t.subCategory === recentTopicObj.subCategory
                )
                .sort((a, b) => (a.order || 0) - (b.order || 0));

              const idx = sameTrack.findIndex(
                (t) => t._id === recentTopicObj._id
              );
              if (idx >= 0 && idx < sameTrack.length - 1) {
                const next = sameTrack[idx + 1];
                if (!completedTopicIds.has(next._id)) {
                  recommended = next;
                }
              }
            }

            if (!recommended) {
              recommended =
                topics.find((t) => !completedTopicIds.has(t._id)) || null;
            }

            setRecommendedTopic(recommended);
          }
        } else {
          setRecentTopic(null);
          setRecommendedTopic(null);
        }

        // Progress sections
        const grouped = {};
        topics.forEach((t) => {
          const key = `${t.mainCategory}:::${t.subCategory}`;
          if (!grouped[key]) {
            grouped[key] = {
              mainCategory: t.mainCategory,
              subCategory: t.subCategory,
              topics: [],
            };
          }
          grouped[key].topics.push(t);
        });

        const sectionList = Object.values(grouped).map((g) => {
          const totalTopics = g.topics.length;
          const completedTopics = g.topics.filter((t) =>
            completedTopicIds.has(t._id)
          ).length;
          return {
            id: `${g.mainCategory}-${g.subCategory}`,
            title: g.subCategory,
            subtitle: g.mainCategory,
            total: totalTopics,
            completed: completedTopics,
          };
        });
        setSections(sectionList);

        // Recent activity
        const progressWithTopics = progress
          .filter((p) => p.completedAt)
          .map((p) => {
            const topicId = p.topicId?._id || p.topicId;
            const topic =
              p.topicId?._id && typeof p.topicId === "object"
                ? p.topicId
                : topics.find((t) => t._id === topicId);
            return { ...p, topic };
          })
          .filter((p) => p.topic);

        const recentSorted = [...progressWithTopics].sort(
          (a, b) => new Date(b.completedAt) - new Date(a.completedAt)
        );
        setRecent(recentSorted.slice(0, 5));

        // ────────────────────────────────────────────────
        // IMPROVED: Last 7 days activity graph
        // ────────────────────────────────────────────────
        const getDateKey = (date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };

        const completedDateKeys = progressWithTopics.map((p) =>
          getDateKey(new Date(p.completedAt))
        );

        const uniqueDays = new Set(completedDateKeys);
        setActiveDays(uniqueDays.size);

        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to midnight local time

        const series = [];
        let maxValue = 0;

        for (let i = 6; i >= 0; i--) {
          const day = new Date(today);
          day.setDate(today.getDate() - i);

          const key = getDateKey(day);
          const count = completedDateKeys.filter((k) => k === key).length;

          maxValue = Math.max(maxValue, count);

          series.push({
            label: day.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
            }),
            value: count,
            fullDate: day.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            isToday: i === 0,
          });
        }

        setDailySeries(series);

        if (meRes.data) {
          setUser(meRes.data);
          localStorage.setItem("user", JSON.stringify(meRes.data));
        }
      } catch (err) {
        console.error(err);
        setSummary((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  const maxDaily = dailySeries.reduce((max, d) => Math.max(max, d.value), 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="p-6 lg:p-8 space-y-8">
        {/* Welcome + quick stats */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your personalized learning dashboard – track your progress and
              pick up where you left off.
            </p>
          </div>

          {!summary.loading && (
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="px-3 py-2 rounded-xl bg-blue-50 text-blue-800">
                <p className="font-semibold">{summary.completed}</p>
                <p className="text-[11px]">Modules completed</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800">
                <p className="font-semibold">{user?.streak || 0}</p>
                <p className="text-[11px]">Day streak</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-800">
                <p className="font-semibold">{summary.avgMinutes || 0} min</p>
                <p className="text-[11px]">Avg time / module</p>
              </div>
            </div>
          )}
        </div>

        {/* Overall progress + 7-day graph */}
        {!summary.loading && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-2">
              <ProgressCard
                title="Overall Learning Progress"
                subtitle="Based on modules you’ve completed from the roadmaps"
                completed={summary.completed}
                total={summary.total}
              />
              <p className="text-xs text-gray-500">
                Modules completed:{" "}
                <span className="font-semibold text-gray-800">
                  {summary.completed}
                </span>
                {" · "}
                Avg learning time per module:{" "}
                <span className="font-semibold text-gray-800">
                  {summary.avgMinutes} min
                </span>
              </p>
            </div>

            {/* ──────────────────────────────
                IMPROVED 7-DAY GRAPH
            ────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-800">
                  Last 7 Days
                </p>
                <p className="text-xs text-gray-500">
                  Modules completed per day
                </p>
              </div>

              <div className="flex items-end gap-3 h-32 pt-2" style={{ minHeight: 120 }}>
                {dailySeries.length === 0 ? (
                  <div className="w-full flex items-center justify-center text-gray-400 text-sm">
                    Loading…
                  </div>
                ) : (
                  dailySeries.map((d) => {
                    const heightPercent =
                      maxDaily > 0 ? Math.max((d.value / maxDaily) * 100, 6) : 6;

                    return (
                      <div
                        key={d.label}
                        className="flex-1 flex flex-col items-center justify-end group relative min-w-0"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                          {d.fullDate}: <strong>{d.value}</strong> module{d.value !== 1 ? "s" : ""}
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            d.isToday
                              ? "bg-blue-600 shadow-md"
                              : d.value > 0
                                ? "bg-blue-400"
                                : "bg-gray-200"
                          }`}
                          style={{
                            height: `${heightPercent}%`,
                            minHeight: "8px",
                          }}
                        />

                        {/* Label */}
                        <span className="mt-2 text-[10px] text-gray-500 font-medium truncate w-full text-center">
                          {d.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="text-center text-xs text-gray-500 mt-3">
                Total this week:{" "}
                <span className="font-semibold text-gray-700">
                  {dailySeries.reduce((sum, d) => sum + d.value, 0)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Continue / Streak / Recommended */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Continue Learning */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-100 hover:border-blue-200 flex flex-col gap-2 transition-colors">
            <h3 className="font-bold text-gray-900 text-sm">
              Continue Learning
            </h3>
            {recentTopic ? (
              <>
                <p className="text-[11px] text-gray-500">
                  {recentTopic.mainCategory} • {recentTopic.subCategory}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Module {recentTopic.order}: {recentTopic.name}
                </p>
                <button
                  onClick={() => {
                    localStorage.setItem(
                      "topic",
                      JSON.stringify({
                        main: recentTopic.mainCategory,
                        sub: recentTopic.subCategory,
                      })
                    );
                    navigate(`/flashcards/${recentTopic._id}`);
                  }}
                  className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                >
                  Open module →
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Start your first module from Bites.
              </p>
            )}
          </div>

          {/* Daily Streak */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-100 hover:border-emerald-200 transition-colors">
            <h3 className="font-bold text-gray-900 text-sm">Daily Streak</h3>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">
              {user?.streak || 0}
              <span className="ml-1 text-sm text-gray-500">days</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Keep a streak by completing at least one module each day.
            </p>
          </div>

          {/* Recommended */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-100 hover:border-indigo-200 flex flex-col gap-2 transition-colors">
            <h3 className="font-bold text-gray-900 text-sm">Recommended</h3>
            {recommendedTopic ? (
              <>
                <p className="text-[11px] text-gray-500">
                  {recommendedTopic.mainCategory} •{" "}
                  {recommendedTopic.subCategory}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  Module {recommendedTopic.order}: {recommendedTopic.name}
                </p>
                <button
                  onClick={() => {
                    localStorage.setItem(
                      "topic",
                      JSON.stringify({
                        main: recommendedTopic.mainCategory,
                        sub: recommendedTopic.subCategory,
                      })
                    );
                    navigate(`/flashcards/${recommendedTopic._id}`);
                  }}
                  className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                >
                  Start this module →
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                All modules are completed. Great job!
              </p>
            )}
          </div>
        </div>

        {/* Progress by topic */}
        {sections.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Progress by topic
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((s) => (
                <ProgressCard
                  key={s.id}
                  title={s.title}
                  subtitle={s.subtitle}
                  completed={s.completed}
                  total={s.total}
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        {recent.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Recent activity
            </h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
              {recent.map((p) => {
                const d = new Date(p.completedAt);
                return (
                  <div
                    key={p._id}
                    className="px-4 py-3 flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        Module {p.topic.order}: {p.topic.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {p.topic.mainCategory} • {p.topic.subCategory}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {d.toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;