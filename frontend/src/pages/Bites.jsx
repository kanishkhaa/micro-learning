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
    localStorage.setItem("topic", JSON.stringify({ main, sub }));

    // next we will show bite list page
    navigate("/topic-bites");
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <h2 className="text-xl font-bold">Choose Your Learning Path</h2>

        {!progressSummary.loading && (
          <div className="space-y-2">
            <ProgressCard
              title="Overall Progress"
              subtitle="See how many modules you’ve finished across all paths"
              completed={progressSummary.completed}
              total={progressSummary.total}
            />
            <p className="text-xs text-gray-500">
              Modules completed:{" "}
              <span className="font-semibold text-gray-800">
                {progressSummary.completed}
              </span>
              {" · "}
              Avg learning time per module:{" "}
              <span className="font-semibold text-gray-800">
                {progressSummary.avgMinutes} min
              </span>
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {data.map((d, i) => (
            <BiteCard
              key={i}
              title={d.title}
              items={d.items}
              onSelect={select}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Bites;
