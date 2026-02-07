import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const res = await API.post("/auth/google", {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        googleId: decoded.sub,
      });

      // store token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/home");
    } catch (err) {
      setError("Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Micro Learning Login
        </h2>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => setError("Google Sign In Failed")}
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Continue with Google to access micro bites
        </p>
      </div>
    </div>
  );
};

export default Login;
