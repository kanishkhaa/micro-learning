import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
      setIsAdmin(storedUser?.role === "admin");
    } catch (err) {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  const userMenu = [
    { name: "Dashboard", path: "/home", icon: "📊" },
    { name: "Bites", path: "/bites", icon: "📖" },
    { name: "Quizzes", path: "/quizzes", icon: "🎯" },
    { name: "Favorites", path: "/favorites", icon: "⭐" },
    { name: "Leaderboard", path: "/leaderboard", icon: "🏅" },
    { name: "Forum", path: "/forum", icon: "💬" },
    { name: "Requests", path: "/requests", icon: "📝" },
    { name: "Support", path: "/support", icon: "🛟" },
    { name: "Notifications", path: "/notifications", icon: "🔔" },
  ];

  const adminMenu = [
    { name: "Admin Analytics", path: "/admin/analytics", icon: "🛠️" },
    { name: "All Requests", path: "/admin/requests", icon: "📝" },
    { name: "Support Tickets", path: "/admin/support", icon: "🛟" },
     { name: "Flashcards", path: "/admin/flashcards", icon: "🧠" },
  ];

  const menu = isAdmin ? adminMenu : userMenu;

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-5 fixed flex flex-col shadow-xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold tracking-tight">
          Micro Learning
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Learn in bite-sized chunks
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {menu.map((m) => {
          const isActive = location.pathname === m.path;
          return (
            <button
              key={m.path}
              type="button"
              onClick={() => navigate(m.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-sm transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
            >
              <span className="text-lg">{m.icon}</span>
              <span>{m.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200"
        >
          <span className="text-lg">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;