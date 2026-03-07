import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const STATUS_OPTIONS = ["open", "in_progress", "resolved"];

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingResponse, setEditingResponse] = useState({});

  const loadAll = async () => {
    try {
      setLoading(true);
      const res = await API.get("/support");
      setTickets(res.data || []);
    } catch (err) {
      console.log(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const updateTicket = async (id, updates) => {
    try {
      await API.patch(`/support/${id}`, updates);
      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSaveResponse = async (ticketId) => {
    const response = editingResponse[ticketId];
    if (!response || !response.trim()) return;
    await updateTicket(ticketId, { response, status: "in_progress" });
    setEditingResponse((prev) => ({ ...prev, [ticketId]: "" }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🛟 Support Tickets
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                View and respond to support queries raised by learners.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
              <span>Tickets</span>
              {loading && <span className="text-gray-400">Loading…</span>}
            </div>
            {tickets.length === 0 && !loading && (
              <div className="p-4 text-xs text-gray-500">
                No support tickets yet.
              </div>
            )}
            <div className="divide-y divide-gray-100">
              {tickets.map((t) => (
                <div key={t._id} className="px-4 py-3 text-sm space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {t.issueTitle}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {t.userId?.name} ({t.userId?.email}) ·{" "}
                        {new Date(t.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <select
                      value={t.status}
                      onChange={(e) =>
                        updateTicket(t._id, { status: e.target.value })
                      }
                      className="text-[11px] px-2 py-1 rounded-full border border-gray-300 bg-white"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                    {t.description}
                  </p>

                  {t.response && (
                    <div className="mt-1 text-xs text-gray-700 bg-slate-50 rounded-xl px-3 py-2">
                      <p className="font-semibold text-[11px] text-gray-600 mb-1">
                        Current response:
                      </p>
                      <p className="whitespace-pre-wrap">{t.response}</p>
                    </div>
                  )}

                  <div className="mt-1 space-y-1">
                    <textarea
                      rows={2}
                      placeholder="Write or update your response…"
                      value={editingResponse[t._id] ?? ""}
                      onChange={(e) =>
                        setEditingResponse((prev) => ({
                          ...prev,
                          [t._id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveResponse(t._id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Save Response
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSupport;

