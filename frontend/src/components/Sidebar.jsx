import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/home" },
    { name: "Bites", path: "/bites" },
    { name: "Quizzes", path: "/quizzes" },
    { name: "Favorites", path: "/favorites" },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-5 fixed">

      <h1 className="text-xl font-bold mb-8">
        Micro Learning
      </h1>

      {menu.map((m, i) => (
        <div
          key={i}
          onClick={() => navigate(m.path)}
          className={`p-2 mb-2 rounded cursor-pointer ${
            location.pathname === m.path
              ? "bg-blue-600"
              : "hover:bg-gray-800"
          }`}
        >
          {m.name}
        </div>
      ))}

      <div
        onClick={logout}
        className="p-2 mt-6 bg-red-600 rounded cursor-pointer"
      >
        Logout
      </div>

    </div>
  );
};

export default Sidebar;
