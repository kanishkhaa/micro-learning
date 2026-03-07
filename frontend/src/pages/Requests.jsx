import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ topicTitle: "", description: "" });
  const [loading, setLoading] = useState(false);

  const loadMine = async () => {
    try {
      setLoading(true);
      const res = await API.get("/requests/mine");
      setRequests(res.data || []);
    } catch (err) {
      console.log(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMine();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topicTitle.trim() || !form.description.trim()) return;
    try {
      await API.post("/requests", form);
      setForm({ topicTitle: "", description: "" });
      await loadMine();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📝 Content Requests
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Suggest new topics you’d like to learn. Admins can accept or
              complete requests.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3"
          >
            <input
              type="text"
              placeholder="Topic title (e.g. React Hooks, OS Scheduling)"
              value={form.topicTitle}
              onChange={(e) =>
                setForm((f) => ({ ...f, topicTitle: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              rows={3}
              placeholder="Why do you want this topic? Any specific sub-topics?"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit Request
            </button>
          </form>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              My Requests
            </div>
            {loading && (
              <div className="p-4 text-xs text-gray-400">Loading…</div>
            )}
            {!loading && requests.length === 0 && (
              <div className="p-4 text-xs text-gray-500">
                You haven’t requested any topics yet.
              </div>
            )}
            {requests.map((r) => (
              <div
                key={r._id}
                className="px-4 py-3 border-t border-gray-100 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900">
                    {r.topicTitle}
                  </p>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${
                      r.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : r.status === "accepted"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-slate-50 text-slate-700 border border-slate-100"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                  {r.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Requests;

