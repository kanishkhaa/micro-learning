import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";

const Favourites = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    API.get("/favorites/topics")
      .then((res) => setTopics(res.data || []))
      .catch((err) => console.log(err));
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
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold">Favourite Modules</h2>
        <p className="text-sm text-gray-500">
          These are the topics you’ve marked as favourites from the roadmap.
        </p>

        {topics.length === 0 && (
          <p className="text-sm text-gray-500">
            You haven&apos;t added any favourites yet. Open a roadmap and mark a
            module as favourite.
          </p>
        )}

        {topics.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            {topics.map((t) => (
              <button
                key={t._id}
                type="button"
                onClick={() => openModule(t)}
                className="text-left p-4 bg-white shadow rounded border border-gray-100 flex flex-col gap-2 hover:bg-blue-50/40 transition"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {t.mainCategory} • {t.subCategory}
                </p>
                <p className="font-semibold text-gray-900">
                  Module {t.order}: {t.name}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Open module and view flashcards →
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Favourites;

