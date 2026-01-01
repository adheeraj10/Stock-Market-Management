import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function CompanyForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    companyName: "",
    symbol: "",
    stockPrice: "",
    totalShares: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.companyName ||
      !formData.symbol ||
      !formData.stockPrice ||
      !formData.totalShares
    ) {
      setError("All fields are required");
      return;
    }

    if (isNaN(formData.stockPrice) || isNaN(formData.totalShares)) {
      setError("Stock price and total shares must be numbers");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/admin/companies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            companyName: formData.companyName,
            symbol: formData.symbol.toUpperCase(),
            stockPrice: parseFloat(formData.stockPrice),
            totalShares: parseInt(formData.totalShares),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add company");
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Add New Company</h2>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-gray-100 transition-colors duration-200"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-500/90 text-white p-3 rounded-lg mb-4 flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-300 mb-2 font-medium">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-100 placeholder-gray-400 transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">Symbol</label>
          <input
            type="text"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-100 placeholder-gray-400 transition-colors duration-200"
            placeholder="e.g., AAPL"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">
            Stock Price ($)
          </label>
          <input
            type="number"
            name="stockPrice"
            value={formData.stockPrice}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-100 placeholder-gray-400 transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2 font-medium">
            Total Shares
          </label>
          <input
            type="number"
            name="totalShares"
            value={formData.totalShares}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2.5 rounded-lg bg-gray-700/50 border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-gray-100 placeholder-gray-400 transition-colors duration-200"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-gray-100 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium hover:scale-[1.02] transition-all duration-200"
          >
            Add Company
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchCompanies()]);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/companies`);
      if (!response.ok) throw new Error("Failed to fetch companies");
      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      setError("Failed to load companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: userEmail }),
          }
        );
        if (!response.ok) throw new Error("Failed to delete user");
        fetchUsers();
      } catch (err) {
        setError("Failed to delete user");
        console.error(err);
      }
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await fetch(
          `${API_URL}/api/admin/companies/${companyId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to delete company");
        fetchCompanies();
      } catch (err) {
        setError("Failed to delete company");
        console.error(err);
      }
    }
  };

  if (loading)
    return <div className="text-white text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Admin Dashboard
        </h1>

        <div className="space-y-8">
          {/* Users Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/30">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-200 mb-5">
                User Management
              </h2>
              <div className="overflow-x-auto rounded-lg border border-gray-700/50">
                <table className="w-full bg-gray-900/70">
                  <thead className="bg-gray-800/70">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                        Name
                      </th>
                      <th className="px-6 py-4 text-center text-gray-300 font-semibold">
                        Email
                      </th>
                      <th className="px-6 py-4 text-right text-gray-300 font-semibold">
                        Balance
                      </th>
                      <th className="px-6 py-4 text-right text-gray-300 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {users.map((user) => (
                      <tr
                        key={user.user_id}
                        className="hover:bg-gray-800/40 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-left text-gray-200 font-medium">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-left text-blue-400 font-medium">
                          ${user.balance}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              handleDeleteUser(user.user_id, user.email)
                            }
                            className="text-red-400 hover:text-red-300 transition-colors duration-200 px-3 py-1.5 rounded-md hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Companies Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/30">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-semibold text-gray-200">
                  Company Management
                </h2>
                <button
                  onClick={() => setShowCompanyForm(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg text-white font-medium hover:scale-[1.02] transition-all duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Add Company</span>
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-700/50">
                <table className="w-full bg-gray-900/70">
                  <thead className="bg-gray-800/70">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                        Name
                      </th>
                      <th className="px-6 py-4 text-center text-gray-300 font-semibold">
                        Symbol
                      </th>
                      <th className="px-6 py-4 text-right text-gray-300 font-semibold">
                        Stock Price
                      </th>
                      <th className="px-6 py-4 text-right text-gray-300 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {companies.map((company) => (
                      <tr
                        key={company.company_id}
                        className="hover:bg-gray-800/40 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-gray-200 text-left font-medium">
                          {company.company_name}
                        </td>
                        <td className="px-6 py-4 text-blue-400 font-medium">
                          {company.symbol}
                        </td>
                        <td className="px-6 py-4 text-green-400 font-medium">
                          ${company.stock_price}
                        </td>
                        <td className="px-6 py-4 space-x-3">
                          <button
                            onClick={() =>
                              handleDeleteCompany(company.company_id)
                            }
                            className="text-red-400 hover:text-red-300 transition-colors duration-200 px-3 py-1.5 rounded-md hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                          {/*
                          <button
                            onClick={() => navigate(`/admin/edit-company/${company.company_id}`)}
                            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 px-3 py-1.5 rounded-md hover:bg-blue-500/10"
                          >
                            Edit
                          </button>
                          */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Company Form Modal */}
        {showCompanyForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100">
              <CompanyForm
                onClose={() => setShowCompanyForm(false)}
                onSuccess={() => {
                  setShowCompanyForm(false);
                  fetchCompanies();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
