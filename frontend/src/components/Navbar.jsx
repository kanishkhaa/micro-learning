import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
      
      <h1 className="font-bold text-lg">
        Micro Learning
      </h1>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <img
              src={user.picture}
              className="w-8 h-8 rounded-full"
            />

            <span>{user.name}</span>
          </>
        )}

        <button
          onClick={logout}
          className="bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
