import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.get("/leaderboard");
        setUsers(res.data || []);
      } catch (err) {
        console.log(err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🏅 Leaderboard
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Top learners ranked by points and level.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Top 10 Learners
            </div>
            {loading && (
              <div className="p-6 text-sm text-gray-400">Loading leaderboard…</div>
            )}
            {!loading && users.length === 0 && (
              <div className="p-6 text-sm text-gray-500">No users found yet.</div>
            )}
            {!loading &&
              users.map((u, index) => (
                <div
                  key={u._id || index}
                  className="px-4 py-3 flex items-center justify-between text-sm border-t border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 text-center font-semibold text-gray-500">
                      {index + 1}
                    </div>
                    {u.picture && (
                      <img
                        src={u.picture}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.level || "Beginner"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">
                      {u.points || 0} pts
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Streak: {u.streak || 0} days
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;

