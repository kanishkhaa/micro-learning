import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ issueTitle: "", description: "" });
  const [loading, setLoading] = useState(false);

  const loadMine = async () => {
    try {
      setLoading(true);
      const res = await API.get("/support/mine");
      setTickets(res.data || []);
    } catch (err) {
      console.log(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMine();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.issueTitle.trim() || !form.description.trim()) return;
    try {
      await API.post("/support", form);
      setForm({ issueTitle: "", description: "" });
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
              🛟 Help & Support
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Raise issues or questions. Admins can respond with solutions or
              debugging help.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3"
          >
            <input
              type="text"
              placeholder="Issue title"
              value={form.issueTitle}
              onChange={(e) =>
                setForm((f) => ({ ...f, issueTitle: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              rows={3}
              placeholder="Describe your issue in detail..."
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
              Submit Ticket
            </button>
          </form>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              My Support Tickets
            </div>
            {loading && (
              <div className="p-4 text-xs text-gray-400">Loading…</div>
            )}
            {!loading && tickets.length === 0 && (
              <div className="p-4 text-xs text-gray-500">
                You haven’t created any support tickets yet.
              </div>
            )}
            {tickets.map((t) => (
              <div
                key={t._id}
                className="px-4 py-3 border-t border-gray-100 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {t.issueTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                      {t.description}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full ${
                      t.status === "resolved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : t.status === "in_progress"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-slate-50 text-slate-700 border border-slate-100"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                {t.response && (
                  <div className="mt-2 text-xs text-gray-700 bg-slate-50 rounded-xl px-3 py-2">
                    <p className="font-semibold text-[11px] text-gray-600 mb-1">
                      Admin response:
                    </p>
                    <p className="whitespace-pre-wrap">{t.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Support;

