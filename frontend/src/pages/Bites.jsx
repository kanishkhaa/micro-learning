import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import BiteCard from "../components/BiteCard";
import ProgressCard from "../components/ProgressCard";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Bites = () => {
  const navigate = useNavigate();

  const [progressSummary, setProgressSummary] = useState({
    total: 0,
    completed: 0,
    avgMinutes: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchProgress = async () => {
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
          durations.length > 0 ? Math.round(totalMs / durations.length / 60000) : 0;

        setProgressSummary({
          total,
          completed,
          avgMinutes,
          loading: false,
        });
      } catch (err) {
        console.log(err);
        setProgressSummary((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchProgress();
  }, []);

  const data = [
    {
      title: "Programming",
      items: ["C", "C++", "Java", "Python"],
    },
    {
      title: "Technology",
      items: ["HTML", "CSS", "JavaScript", "React"],
    },
    {
      title: "CS Fundamentals",
      items: ["OS", "CN"],
    },
    {
      title: "DSA",
      items: ["OOPS"],
    },
  ];

  const select = (main, sub) => {
    const selectedTopic = { main, sub };
    localStorage.setItem("topic", JSON.stringify(selectedTopic));
    navigate("/topic-bites", { state: selectedTopic });
  };

  const CATEGORY_ICONS = { Programming: "💻", Technology: "🌐", "CS Fundamentals": "📚", DSA: "🧩" };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="p-6 lg:p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📖 Choose Your Learning Path</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select a category, then pick a topic to see its modules and start learning.
            </p>
          </div>

          {!progressSummary.loading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <ProgressCard
                title="Overall Progress"
                subtitle="Modules completed across all paths"
                completed={progressSummary.completed}
                total={progressSummary.total}
              />
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span><strong className="text-gray-800">{progressSummary.completed}</strong> modules done</span>
                <span><strong className="text-gray-800">{progressSummary.avgMinutes} min</strong> avg per module</span>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {data.map((d, i) => (
              <div key={i} className="relative">
                <BiteCard
                  title={d.title}
                  items={d.items}
                  onSelect={select}
                  icon={CATEGORY_ICONS[d.title]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Bites;
