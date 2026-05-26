import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, form, {
        withCredentials: true,
      });

      const { user, accessToken } = response.data;

      login(user, accessToken);

      if (!user.githubUsername && !user.leetcodeUsername) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {}
  }

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 shadow-lg shadow-indigo-500/10 overflow-visible">
        <h1
          className="text-2xl font-bold text-white mb-6 text-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Login to your account
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={form.email}
            placeholder="Enter Email"
            onChange={handleChange}
            className="bg-[#020817] border border-[#1e293b] text-white rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            placeholder="Enter Password"
            onChange={handleChange}
            className="bg-[#020817] border border-[#1e293b] text-white rounded-lg px-4 py-3 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />

          <button
            type="submit"
            className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Submit
          </button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          Don’t have an account?{" "}
          <span
            className="text-indigo-400 cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
