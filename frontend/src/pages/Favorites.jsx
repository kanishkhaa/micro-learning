import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";

const Favourites = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get("/favorites/topics")
      .then((res) => setTopics(res.data || []))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const openModule = (t) => {
    localStorage.setItem(
      "topic",
      JSON.stringify({
        main: t.mainCategory,
        sub: t.subCategory,
      })
    );
    navigate(`/flashcards/${t._id}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30">
        <div className="p-6 lg:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">⭐ Favourite Modules</h2>
            <p className="text-sm text-gray-500 mt-1">
              Modules you&apos;ve marked as favourites – quick access to your most-used content.
            </p>
          </div>

          {loading && (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-gray-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          )}

          {!loading && topics.length === 0 && (
            <div className="text-center py-20 bg-white/80 rounded-2xl border-2 border-gray-100">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No favourites yet</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Open a roadmap from Bites, pick a topic, and click &quot;Add to Favorites&quot; on any module to add it here.
              </p>
              <button
                type="button"
                onClick={() => navigate("/bites")}
                className="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600"
              >
                Go to Bites
              </button>
            </div>
          )}

          {!loading && topics.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((t) => (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => openModule(t)}
                  className="text-left p-5 bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-amber-200 hover:shadow-lg transition-all flex flex-col gap-2 group"
                >
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    {t.mainCategory} • {t.subCategory}
                  </span>
                  <p className="font-semibold text-gray-900 group-hover:text-amber-700">
                    Module {t.order}: {t.name}
                  </p>
                  <p className="text-xs text-amber-600 mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open flashcards →
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Favourites;
