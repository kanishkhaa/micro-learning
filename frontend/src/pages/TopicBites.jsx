import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

const TopicBites = () => {
  const [bites, setBites] = useState([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const topic = JSON.parse(localStorage.getItem("topic"));

  useEffect(() => {
    if (!topic?.main || !topic?.sub) return;
    const fetchBites = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("main", topic.main);
        params.set("sub", topic.sub);
        if (search.trim()) params.set("q", search.trim());
        if (level !== "All") params.set("level", level);

        const res = await API.get(`/bites?${params.toString()}`);
        const data = res.data || [];
        setBites(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0]._id);
        }
      } catch (err) {
        console.log(err);
        setBites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBites();
  }, [topic?.main, topic?.sub, search, level]);

  const selectedBite = useMemo(
    () => bites.find((b) => b._id === selectedId) || null,
    [bites, selectedId]
  );

  if (!topic) {
    return (
      <Layout>
        <div className="p-6">
          <p className="text-gray-500">Select a topic from Bites to view its concepts.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {topic.sub} Concepts
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Browse bite-sized notes for {topic.main} → {topic.sub}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bites by title or keyword..."
              className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 text-sm border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l === "All" ? "All levels" : l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Horizontal bite navigation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          {loading && (
            <div className="text-xs text-gray-400 px-1 py-1.5">Loading bites…</div>
          )}
          {!loading && bites.length === 0 && (
            <p className="text-sm text-gray-500 px-1 py-1.5">
              No content added yet. Try changing your search or filters.
            </p>
          )}

          {bites.length > 0 && (
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2 min-w-max">
                {bites.map((b) => {
                  const isActive = b._id === selectedId;
                  return (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => setSelectedId(b._id)}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-300"
                          : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                      }`}
                    >
                      {b.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected bite content */}
        {selectedBite && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">
                {selectedBite.title}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {selectedBite.level || "Beginner"}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {selectedBite.content}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TopicBites;
