import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Onboarding() {
  const { accessToken, user } = useAuth();

  const [form, setForm] = useState({
    githubUsername: user?.githubUsername || "",
    leetcodeUsername: user?.leetcodeUsername || "",
  });

  const isUpdate = user?.githubUsername || user?.leetcodeUsername;

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
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 shadow-lg shadow-indigo-500/10">
        <h1
          className="text-2xl font-bold text-white mb-6 text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {isUpdate ? "Update your Profiles" : "Connect your Profiles"}
        </h1>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter Github username"
            name="githubUsername"
            value={form.githubUsername}
            onChange={handleChange}
            className="bg-[#020817] border border-[#1e293b] text-white rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />

          <input
            type="text"
            placeholder="Enter Leetcode username"
            name="leetcodeUsername"
            value={form.leetcodeUsername}
            onChange={handleChange}
            className="bg-[#020817] border border-[#1e293b] text-white rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />

          <button
            disabled={loading}
            className="mt-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
          >
            {loading ? "Saving..." : isUpdate ? "Update" : "Continue"}
          </button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          You can update these later .
        </p>
      </div>
    </div>
  );
}

export default Onboarding;
