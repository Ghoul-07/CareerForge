import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const { accessToken, user } = useAuth();
  const [github, setGithub] = useState(null);
  const [leetcode, setLeetcode] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

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
        const response = await axios.get(
          "http://localhost:3000/api/user/dashboard",
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        setGithub(response.data.github);
        setLeetcode(response.data.leetcode);
        setResumeAnalysis(response.data.resumeAnalysis);
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
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
          <ReadinessCard
            label="Resume Match"
            score={resumeAnalysis ? resumeAnalysis.atsScore : 0}
            color="#f59e0b"
          />
          <ReadinessCard
            label="Overall"
            score={Math.round(
              (dsaScore +
                ghScore +
                (resumeAnalysis ? resumeAnalysis.atsScore : 0)) /
                3,
            )}
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
