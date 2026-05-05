import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // which session is expanded
  const { accessToken } = useAuth();

  const [showJD, setShowJD] = useState([]);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/resume/history",
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        setSessions(response.data.sessions);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const scoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const difficultyStyle = (difficulty) => {
    if (difficulty === "Senior")
      return "bg-red-500/10 border-red-500/20 text-red-400";
    if (difficulty === "Mid")
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
    return "bg-green-500/10 border-green-500/20 text-green-400";
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  function handleShowJD(result_id) {
    setShowJD(
      (prev) =>
        prev.includes(result_id)
          ? prev.filter((id) => id !== result_id) //remove
          : [...prev, result_id], // add
    );
  }

  const getDownloadUrl = (url, filename) => {
    if (!url) return "#";

    const safeName = filename
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white py-10 ">
      <div className="w-full max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-2">
            Resume Analyzer
          </p>
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Analysis History
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {sessions.length} sessions found
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-[#0f172a] border border-dashed border-[#1e293b] rounded-2xl p-10 text-center">
            <p className="text-slate-500 text-sm">
              No analyses yet. Go analyze your resume!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="bg-[#0f172a] border border-[#1e293b] rounded-2xl overflow-hidden"
              >
                {/* Session header — always visible */}
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#1e293b]/30 transition-all"
                  onClick={() =>
                    setExpanded(expanded === session._id ? null : session._id)
                  }
                >
                  <div className="flex flex-col gap-1">
                    {/* Display the resume */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        📄{" "}
                        <span className="font-medium">
                          {session.resume.originalName}
                        </span>
                      </div>

                      {session.resume?.url && (
                        <>
                          <a
                            href={session.resume.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                          >
                            View Resume
                          </a>
                          <a
                            href={getDownloadUrl(
                              session.resume?.url,
                              session.resume?.originalName,
                            )}
                            onClick={(e) => e.stopPropagation()}
                            className="text-green-400 text-xs hover:text-green-300 underline"
                          >
                            Download
                          </a>
                        </>
                      )}
                    </div>

                    <p className="text-xs font-mono text-slate-500">
                      {formatDate(session.createdAt)}
                    </p>

                    <div className="flex gap-2 flex-wrap mt-1">
                      {session.results.map((result, i) => (
                        <span
                          key={i}
                          className={`text-xs font-mono px-2 py-0.5 rounded-full border ${difficultyStyle(result.difficulty)}`}
                        >
                          {result.difficulty} · {result.atsScore}%
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-slate-500 text-sm">
                    {expanded === session._id ? "▲" : "▼"}
                  </span>
                </div>

                {/* Expanded results */}
                {expanded === session._id && (
                  <div className="border-t border-[#1e293b] p-5 flex flex-col gap-6">
                    {session.results.map((result, index) => (
                      <div key={index} className="flex flex-col gap-4">
                        {/* Result header */}

                        <div>
                          <button
                            type="button"
                            onClick={() => handleShowJD(result._id)}
                          >
                            Job Description{" "}
                            {showJD.includes(result._id) ? "▲" : "▼"}
                          </button>
                        </div>

                        {showJD.includes(result._id) && (
                          <div className="bg-[#020817] border border-[#1e293b] rounded-xl p-4 max-h-48 overflow-y-auto">
                            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                              {result.jobDescription}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                          </span>
                          <span
                            className="text-2xl font-bold"
                            style={{ color: scoreColor(result.atsScore) }}
                          >
                            {result.atsScore}
                          </span>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded-full border ${difficultyStyle(result.difficulty)}`}
                          >
                            {result.difficulty}
                          </span>
                        </div>

                        {/* Missing Skills */}
                        <div>
                          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                            Missing Skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.missingSkills.map((skill, i) => (
                              <span
                                key={i}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono px-2 py-0.5 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Weak Points */}
                        <div>
                          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                            Weak Points
                          </p>
                          <ul className="flex flex-col gap-2">
                            {result.weakPoints.map((point, i) => (
                              <li
                                key={i}
                                className="flex gap-3 items-start text-sm text-slate-400"
                              >
                                <span className="text-yellow-400 mt-0.5">
                                  ⚠
                                </span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Improved Points */}
                        <div>
                          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                            Improved Suggestions
                          </p>
                          <ul className="flex flex-col gap-2">
                            {result.improvedPoints.map((point, i) => (
                              <li
                                key={i}
                                className="flex gap-3 items-start text-sm text-slate-400"
                              >
                                <span className="text-green-400 mt-0.5">✓</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Overall Feedback */}
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                          <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">
                            Feedback
                          </p>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {result.overallFeedback}
                          </p>
                        </div>

                        {index < session.results.length - 1 && (
                          <div className="border-t border-[#1e293b]" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
