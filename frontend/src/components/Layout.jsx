import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full min-h-screen bg-gray-100">
        {children}
      </div>
    </div>
  );
};

export default Layout;
