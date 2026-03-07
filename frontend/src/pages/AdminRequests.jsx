import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const STATUS_OPTIONS = ["pending", "accepted", "completed"];

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const res = await API.get("/requests");
      setRequests(res.data || []);
    } catch (err) {
      console.log(err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/requests/${id}`, { status });
      await loadAll();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                📝 All Content Requests
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                View and manage topic requests submitted by learners.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
              <span>Requests</span>
              {loading && <span className="text-gray-400">Loading…</span>}
            </div>
            {requests.length === 0 && !loading && (
              <div className="p-4 text-xs text-gray-500">
                No requests yet.
              </div>
            )}
            <div className="divide-y divide-gray-100">
              {requests.map((r) => (
                <div key={r._id} className="px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {r.topicTitle}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {r.userId?.name} ({r.userId?.email}) ·{" "}
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r._id, e.target.value)}
                      className="text-[11px] px-2 py-1 rounded-full border border-gray-300 bg-white"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                    {r.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminRequests;

