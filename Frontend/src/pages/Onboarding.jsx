import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Onboarding() {
  const [form, setForm] = useState({
    githubUsername: "",
    leetcodeUsername: "",
  });
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      setError("");
      await axios.post("http://localhost:3000/api/user/onboarding", form, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* MAIN CONTENT */}
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">
            Connect your Profiles
          </h1>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter Github username"
              name="githubUsername"
              value={form.githubUsername}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Enter Leetcode username"
              name="leetcodeUsername"
              value={form.leetcodeUsername}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />

            <button
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
