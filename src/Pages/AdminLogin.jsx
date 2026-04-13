import React, { useState } from "react";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa"; // Import icons

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/api/admin_login`,
        credentials
      );
      if (response.status === 200) {
        navigate("/admin");
      }
    } catch (error) {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold text-gray-200 mb-6 text-center">
          Admin Login
        </h2>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <label className="block text-gray-300 mb-2">Email</label>
            <div className="flex items-center">
              <FaUser className="text-gray-400 absolute left-3" />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className="w-full pl-10 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-gray-400 focus:outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="block text-gray-300 mb-2">Password</label>
            <div className="flex items-center">
              <FaLock className="text-gray-400 absolute left-3" />
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full pl-10 p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-gray-400 focus:outline-none"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white py-2 rounded hover:from-gray-800 hover:to-gray-950 transition duration-300 flex items-center justify-center"
          >
            <FaLock className="mr-2" />
            Login
          </button>
        </form>
      </div>
    </div>
  );
}