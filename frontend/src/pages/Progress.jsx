import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ProgressCard from "../components/ProgressCard";
import API from "../services/api";

const Progress = () => {
  const [overall, setOverall] = useState({
    total: 0,
    completed: 0,
    avgMinutes: 0,
    loading: true,
  });
  const [sections, setSections] = useState([]);
  const [recent, setRecent] = useState([]);
  const [activeDays, setActiveDays] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsRes, progressRes] = await Promise.all([
          API.get("/topics"),
          API.get("/progress"),
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

        setOverall({ total, completed, avgMinutes, loading: false });

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

        // Recent activity (last 5 completed modules)
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

        // Active days (distinct dates with completions)
        const dayKeys = new Set(
          progressWithTopics.map((p) => {
            const d = new Date(p.completedAt);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          })
        );
        setActiveDays(dayKeys.size);
      } catch (err) {
        console.log(err);
        setOverall((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Your Progress</h2>
            <p className="text-sm text-gray-500">
              Track how consistently you&apos;re learning across all modules.
            </p>
          </div>
          {!overall.loading && (
            <div className="flex gap-3 text-xs">
              <div className="px-3 py-2 rounded-xl bg-blue-50 text-blue-800">
                <p className="font-semibold">{overall.completed}</p>
                <p className="text-[11px]">Modules completed</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800">
                <p className="font-semibold">{activeDays}</p>
                <p className="text-[11px]">Active days</p>
              </div>
            </div>
          )}
        </div>

        {!overall.loading && (
          <div className="space-y-2">
            <ProgressCard
              title="Overall Progress"
              subtitle="All modules across every learning path"
              completed={overall.completed}
              total={overall.total}
            />
            <p className="text-xs text-gray-500">
              Modules completed:{" "}
              <span className="font-semibold text-gray-800">
                {overall.completed}
              </span>
              {" · "}
              Avg learning time per module:{" "}
              <span className="font-semibold text-gray-800">
                {overall.avgMinutes} min
              </span>
            </p>
          </div>
        )}

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

export default Progress;

