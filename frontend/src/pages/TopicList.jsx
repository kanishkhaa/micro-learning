import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const TopicList = () => {
  const [topics, setTopics] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const navigate = useNavigate();
  const topic = JSON.parse(localStorage.getItem("topic"));

  useEffect(() => {
    API.get(`/topics?main=${topic.main}&sub=${topic.sub}`)
      .then((res) => setTopics(res.data))
      .catch((err) => console.log(err));

    // Load favourite modules (topics)
    API.get("/favorites/topics")
      .then((res) => {
        const ids = (res.data || []).map((t) => t._id);
        setFavoriteIds(ids);
      })
      .catch((err) => console.log(err));
  }, []);

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

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">
          {topic.sub} Roadmap
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {topics.map((t) => {
            const isFav = favoriteIds.includes(t._id);

            return (
              <div
                key={t._id}
                className="p-4 bg-white shadow rounded border border-gray-100 hover:bg-blue-50/40 transition flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/flashcards/${t._id}`)}
                  >
                    <p className="text-sm text-gray-500">
                      Module {t.order}
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {t.name}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleFavorite(t._id, isFav)}
                    className="text-sm px-2 py-1 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100"
                  >
                    {isFav ? "★ Fav" : "☆ Fav"}
                  </button>
                </div>

                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => navigate(`/flashcards/${t._id}`)}
                    className="px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-xs"
                  >
                    Study Flashcards
                  </button>
                  <button
                    onClick={() => navigate(`/quizzes?topicId=${t._id}`)}
                    className="px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs"
                  >
                    Take Quiz
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default TopicList;
