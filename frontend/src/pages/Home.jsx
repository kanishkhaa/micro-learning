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

        // Build "Continue Learning" and "Recommended" modules
        if (topics.length > 0 && progress.length > 0) {
          const progressSorted = [...progress].sort((a, b) => {
            const aTime =
              new Date(a.completedAt || a.startedAt || 0).getTime() || 0;
            const bTime =
              new Date(b.completedAt || b.startedAt || 0).getTime() || 0;
            return bTime - aTime;
          });

          const recentProgress = progressSorted[0];
          if (recentProgress) {
            const recentId =
              recentProgress.topicId && recentProgress.topicId._id
                ? recentProgress.topicId._id
                : recentProgress.topicId;
            const recentTopicObj =
              topics.find((t) => t._id === recentId) || null;
            setRecentTopic(recentTopicObj);

            let recommended = null;
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
                const nextInTrack = sameTrack[idx + 1];
                if (!completedTopicIds.has(nextInTrack._id)) {
                  recommended = nextInTrack;
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

        // Progress by topic (sections)
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

        // Recent activity (last 5 completions)
        const progressWithTopics = progress
          .filter((p) => p.completedAt)
          .map((p) => {
            const topic =
              p.topicId && p.topicId._id
                ? p.topicId
                : topics.find(
                    (t) =>
                      t._id ===
                      (p.topicId && p.topicId._id ? p.topicId._id : p.topicId)
                  );
            return {
              ...p,
              topic,
            };
          })
          .filter((p) => p.topic);

        const recentSorted = [...progressWithTopics].sort(
          (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime()
        );
        setRecent(recentSorted.slice(0, 5));

        // Active days & daily graph (last 7 days)
        const dayKeys = new Set(
          progressWithTopics.map((p) => {
            const d = new Date(p.completedAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          })
        );
        setActiveDays(dayKeys.size);

        const today = new Date();
        const series = [];
        for (let i = 6; i >= 0; i -= 1) {
          const d = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - i
          );
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const count = progressWithTopics.filter((p) => {
            const dp = new Date(p.completedAt);
            const pk = `${dp.getFullYear()}-${dp.getMonth()}-${dp.getDate()}`;
            return pk === key;
          }).length;
          series.push({
            label: `${d.getMonth() + 1}/${d.getDate()}`,
            value: count,
          });
        }
        setDailySeries(series);

        if (meRes.data) {
          setUser(meRes.data);
          localStorage.setItem("user", JSON.stringify(meRes.data));
        }
      } catch (err) {
        console.log(err);
        setSummary((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  const maxDaily = dailySeries.reduce(
    (max, d) => (d.value > max ? d.value : max),
    0
  );

  return (
    <Layout>
      <div className="p-6 space-y-8">
        {/* Top row: welcome + key stats */}
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
                <p className="font-semibold">
                  {summary.avgMinutes || 0} min
                </p>
                <p className="text-[11px]">Avg time / module</p>
              </div>
            </div>
          )}
        </div>

        {/* Overall progress + mini graph */}
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-800">
                  Last 7 days
                </p>
                <p className="text-[11px] text-gray-500">
                  Daily modules completed
                </p>
              </div>
              <div className="flex items-end gap-2 h-24">
                {dailySeries.map((d) => {
                  const height =
                    maxDaily > 0 ? `${(d.value / maxDaily) * 100}%` : "5%";
                  return (
                    <div
                      key={d.label}
                      className="flex-1 flex flex-col items-center justify-end gap-1"
                    >
                      <div
                        className="w-full rounded-full bg-gradient-to-t from-blue-500 to-cyan-400 transition-all"
                        style={{ height }}
                      />
                      <span className="text-[10px] text-gray-500">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Continue / streak / recommended row */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
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
                  type="button"
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

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Daily Streak</h3>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">
              {user?.streak || 0}
              <span className="ml-1 text-sm text-gray-500">days</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Keep a streak by completing at least one module each day.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
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
                  type="button"
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
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Progress by topic
              </h3>
            </div>
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
                const topic = p.topic;
                const d = new Date(p.completedAt);
                const dateString = d.toLocaleDateString();
                return (
                  <div
                    key={p._id}
                    className="px-4 py-3 flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        Module {topic.order}: {topic.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {topic.mainCategory} • {topic.subCategory}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{dateString}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
