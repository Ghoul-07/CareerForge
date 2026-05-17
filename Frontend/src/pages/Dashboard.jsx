import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import api from "../api/api.js";

// Circular progress component
function CircularProgress({
  value,
  size = 120,
  stroke = 10,
  color = "#6366f1",
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1e293b"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
}

// Stat card component
function StatCard({ label, value, sub, accent = "#6366f1" }) {
  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col gap-1 hover:border-[#334155] transition-all">
      <span className="text-xs font-mono tracking-widest uppercase text-slate-500">
        {label}
      </span>
      <span
        className="text-3xl font-bold text-white"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {value ?? "—"}
      </span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}

// Readiness card
function ReadinessCard({ label, score, color }) {
  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-[#334155] transition-all">
      <div className="relative">
        <CircularProgress value={score} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-xl font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {score}%
          </span>
        </div>
      </div>
      <span className="text-sm font-mono tracking-wider text-slate-400 uppercase">
        {label}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [github, setGithub] = useState(null);
  const [leetcode, setLeetcode] = useState(null);
  const [resumeStats, setResumeStats] = useState(null);
  const [interviewStats, setInterviewStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const comingSoon = [
    { label: "Resume Analysis", link: "/resume", ready: true },
    { label: "Interview Simulator", link: "/interview", ready: false },
  ];

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get("/user/dashboard");

        setGithub(response.data.github);
        setLeetcode(response.data.leetcode);
        setResumeStats(response.data.resumeStats);
        setInterviewStats(response.data.interviewStats);
      } catch (err) {
        setError("Something went wrong. Please try again");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  // Compute readiness scores
  const dsaScore = leetcode
    ? Math.min(
        100,
        Math.round(
          (leetcode.easy * 1 + leetcode.medium * 3 + leetcode.hard * 5) / 30,
        ),
      )
    : 0;

  const ghScore = github
    ? Math.min(100, Math.round(Math.log10(github.rawScore + 1) * 20))
    : 0;

  const weakAreaChartData =
    interviewStats?.weakAreaFrequency?.slice(0, 5).map((item) => ({
      ...item,
      shortArea:
        item.area.length > 18 ? item.area.slice(0, 18) + "..." : item.area,
    })) || [];

  const scoreTrendData =
    interviewStats?.scoreTrend?.map((item, index) => ({
      ...item,
      attempt: `Interview ${index + 1}`,
    })) || [];
  if (loading)
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-mono text-sm tracking-widest">
            LOADING YOUR DATA...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <p className="text-red-400 font-mono">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020817] text-white px-6 py-10 ">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-2">
            Career Readiness
          </p>
          <h1
            className="text-4xl font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Welcome back,{" "}
            <span className="text-indigo-400">{user?.username}</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Here's your developer profile at a glance.
          </p>
        </div>

        <button
          onClick={() => navigate("/onboarding")}
          className="border border-[#1e293b] hover:border-indigo-500 text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg transition-all mb-6"
        >
          ✏️ Edit Profiles
        </button>

        {/* Readiness scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <ReadinessCard
            label="DSA Readiness"
            score={dsaScore}
            color="#6366f1"
          />
          <ReadinessCard label="GitHub Score" score={ghScore} color="#10b981" />
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#334155] transition-all">
            <span
              className="text-5xl font-bold text-indigo-400"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {resumeStats?.totalSessions || 0}
            </span>

            <span className="text-xs font-mono tracking-widest uppercase text-slate-400">
              Resume Sessions
            </span>

            <span className="text-xs text-slate-400">
              Avg ATS: {resumeStats?.averageAtsScore || 0}%
            </span>
          </div>
          <ReadinessCard
            label="Overall"
            score={Math.round((dsaScore + ghScore) / 2)}
            color="#ec4899"
          />
        </div>

        {/* GitHub Stats */}
        {github && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <a
                href={`https://github.com/${user?.githubUsername}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={github.avatar}
                  alt="gh avatar"
                  className="w-8 h-8 rounded-full"
                />
              </a>
              <h2
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                GitHub
              </h2>
              <span className="text-xs font-mono text-slate-500 bg-[#0f172a] border border-[#1e293b] px-2 py-1 rounded-full">
                Profile Stats
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Stars"
                value={github.totalStars}
                sub="across all repos"
                accent="#f59e0b"
              />
              <StatCard
                label="Forks"
                value={github.totalForks}
                sub="total forks"
                accent="#10b981"
              />
              <StatCard
                label="Repos"
                value={github.publicRepos}
                sub="public repositories"
                accent="#6366f1"
              />
              <StatCard
                label="Followers"
                value={github.followers}
                sub="GitHub followers"
                accent="#ec4899"
              />
            </div>
          </div>
        )}

        {/* LeetCode Stats */}
        {leetcode && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <a
                href={`https://leetcode.com/${user.leetcodeUsername}`}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={leetcode.avatar}
                  alt="lc avatar"
                  className="w-8 h-8 rounded-full"
                />
              </a>
              <h2
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                LeetCode
              </h2>
              <span className="text-xs font-mono text-slate-500 bg-[#0f172a] border border-[#1e293b] px-2 py-1 rounded-full">
                Problem Solving
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Solved"
                value={leetcode.totalSolved}
                sub="problems solved"
              />
              <StatCard
                label="Easy"
                value={leetcode.easy}
                sub={`${Math.round((leetcode.easy / leetcode.totalSolved) * 100)}% of solved`}
                accent="#10b981"
              />
              <StatCard
                label="Medium"
                value={leetcode.medium}
                sub={`${Math.round((leetcode.medium / leetcode.totalSolved) * 100)}% of solved`}
                accent="#f59e0b"
              />
              <StatCard
                label="Hard"
                value={leetcode.hard}
                sub={`${Math.round((leetcode.hard / leetcode.totalSolved) * 100)}% of solved`}
                accent="#ef4444"
              />
            </div>
          </div>
        )}

        {interviewStats?.scoreTrend?.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-lg font-bold-text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Interview Progress
              </h2>
              <span className="text-xs font-mono text-slate-500 bg-[#0f172a] border border-[#1e293b] px-2 py-1 rounded-full">
                Performance Trend
              </span>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrendData}>
                  <CartesianGrid stroke="#1e293b" />

                  <XAxis
                    dataKey="attempt"
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />

                  <YAxis
                    stroke="$64748b"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    domain={[0, 10]}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="overallScore"
                    stroke="#6366f1"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="technicalScore"
                    stroke="#10b981"
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="communicationScore"
                    stroke="#ec4899"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {weakAreaChartData.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Weak Areas
              </h2>

              <span className="text-xs font-mono text-slate-500 bg-[#0f172a] border border-[#1e293b] px-2 py-1 rounded-full">
                Improvement Insights
              </span>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weakAreaChartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 70 }}
                >
                  <CartesianGrid stroke="#1e293b" />

                  <XAxis
                    dataKey="shortArea"
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={80}
                  />

                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid #1e293b",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                    }}
                    formatter={(value) => [`${value}`, "Count"]}
                    labelFormatter={(_, payload) => {
                      return payload?.[0]?.payload?.area || "";
                    }}
                  />

                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {/* Coming soon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comingSoon.map((item) => (
            <div
              key={item.label}
              className="bg-[#0f172a] border border-dashed border-[#1e293b] rounded-2xl p-6 flex flex-col gap-2 "
            >
              <span className="text-xs font-mono tracking-widest uppercase text-slate-500">
                {item.ready ? "Available" : "Coming Soon"}
              </span>
              <span
                className="text-lg font-bold text-slate-400"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {item.label}
              </span>
              {item.ready && (
                <button
                  onClick={() => navigate(item.link)}
                  className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all w-fit"
                >
                  Get Started →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
