import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

const TopicList = () => {
  const [allTopics, setAllTopics] = useState([]);
  const [groupedTopics, setGroupedTopics] = useState({});
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Prefer route state (passed when navigating from Bites), then localStorage
  const selectedTopic = (() => {
    const state = location.state;
    if (state && state.main && state.sub) return { main: state.main, sub: state.sub };
    try {
      const t = JSON.parse(localStorage.getItem("topic"));
      return t && t.main && t.sub ? t : null;
    } catch {
      return null;
    }
  })();

  // Fetch ALL topics (no filters) - same approach as Quiz page
  useEffect(() => {
    setLoading(true);
    API.get("/topics")
      .then((res) => {
        const data = res.data || [];
        setAllTopics(data);

        const grouped = {};
        data.forEach((t) => {
          if (!grouped[t.mainCategory]) grouped[t.mainCategory] = {};
          if (!grouped[t.mainCategory][t.subCategory]) grouped[t.mainCategory][t.subCategory] = [];
          grouped[t.mainCategory][t.subCategory].push(t);
        });
        setGroupedTopics(grouped);
      })
      .catch((err) => {
        console.error("Failed to fetch topics:", err);
        setAllTopics([]);
        setGroupedTopics({});
      })
      .finally(() => setLoading(false));

    API.get("/favorites/topics")
      .then((res) => {
        const ids = (res.data || []).map((t) => t._id);
        setFavoriteIds(ids);
      })
      .catch((err) => console.log(err));
  }, []);

  // Filter topics by main + sub (client-side, same as Quiz)
  const topics =
    selectedTopic?.main && selectedTopic?.sub
      ? (groupedTopics[selectedTopic.main]?.[selectedTopic.sub] || [])
      : [];

  const toggleFavorite = async (topicId, isFav) => {
    try {
      if (isFav) {
        await API.delete(`/favorites/topics/${topicId}`);
        setFavoriteIds((prev) => prev.filter((id) => id !== topicId));
      } else {
        await API.post(`/favorites/topics/${topicId}`);
        setFavoriteIds((prev) =>
          prev.includes(topicId) ? prev : [...prev, topicId]
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (!selectedTopic) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-gray-500 mb-4">Select a topic from Bites to view its modules.</p>
          <button
            type="button"
            onClick={() => navigate("/bites")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
          >
            Go to Bites
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate("/bites")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-2"
              >
                ← Back to Bites
              </button>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedTopic?.main} → {selectedTopic?.sub} Roadmap
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {topics.length} module{topics.length !== 1 ? "s" : ""} available · Pick one to start
              </p>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <div className="animate-pulse text-gray-400 text-sm">Loading modules…</div>
            </div>
          )}

          {!loading && topics.length === 0 && (
            <div className="text-center py-16 bg-white/80 rounded-2xl border-2 border-gray-100">
              <p className="text-gray-500">No modules in this topic yet.</p>
              <p className="text-xs text-gray-400 mt-1">Add topics and flashcards from the admin section.</p>
              <button
                type="button"
                onClick={() => navigate("/bites")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
              >
                Back to Bites
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((t) => {
              const isFav = favoriteIds.includes(t._id);

              return (
                <div
                  key={t._id}
                  className="p-5 bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex-1 cursor-pointer min-w-0"
                      onClick={() => {
                        localStorage.setItem("topic", JSON.stringify({ main: t.mainCategory, sub: t.subCategory }));
                        navigate(`/flashcards/${t._id}`);
                      }}
                    >
                      <span className="text-xs font-medium text-gray-500">Module {t.order}</span>
                      <p className="font-semibold text-gray-900 mt-1 line-clamp-2">
                        {t.name}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(t._id, isFav); }}
                      className="shrink-0 px-3 py-1.5 rounded-full text-sm border border-gray-200 hover:border-amber-300 bg-gray-50 hover:bg-amber-50 transition-colors"
                    >
                      {isFav ? "★ Favorited" : "☆ Add to Favorites"}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem("topic", JSON.stringify({ main: t.mainCategory, sub: t.subCategory }));
                        navigate(`/flashcards/${t._id}`);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                    >
                      Study Flashcards
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/quizzes?topicId=${t._id}`)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm font-medium"
                    >
                      Take Quiz
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TopicList;
