import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function InterviewSetup() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("fresher");
  const [interviewType, setInterviewType] = useState("mixed");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { accessToken } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      try {
        setError("");
        const response = await axios.get(
          "http://localhost:3000/api/resume/history",
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        setSessions(response.data.sessions);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();

    if (!selectedSessionId || !role || !difficulty || !interviewType) {
      setError("Please provide all details");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const createRes = await axios.post(
        "http://localhost:3000/api/interview/create",
        {
          resumeAnalysisSessionId: selectedSessionId,
          role,
          difficulty,
          interviewType,
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const interviewId = createRes.data.interviewSession._id;

      const startRes = await axios.post(
        `http://localhost:3000/api/interview/start/${interviewId}`,
        {},
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      navigate(`/interview/${interviewId}`, {
        state: {
          firstQuestion: startRes.data.firstQuestion, // to prevent an API call
          totalQuestions: startRes.data.totalQuestions,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  function handleSelect(sessionId) {
    if (selectedSessionId === sessionId) setSelectedSessionId(null);
    else setSelectedSessionId(sessionId);
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white py-10">
      <div className="w-full max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-2">
            Interview Simulator
          </p>

          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Start Mock Interview
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Choose one of your resume analyses and configure your interview.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-[#0f172a] border border-dashed border-[#1e293b] rounded-2xl p-10 text-center">
            <p className="text-slate-500 text-sm">
              No resume analyses found. Analyze your resume first.
            </p>
          </div>
        ) : (
          <form onSubmit={handleStartInterview} className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
                Select Resume for Interview
              </p>

              <div className="flex flex-col gap-3">
                {sessions.map((session) => (
                  <button
                    type="button"
                    key={session._id}
                    onClick={() => handleSelect(session._id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selectedSessionId === session._id
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-[#1e293b] bg-[#0f172a] hover:border-indigo-500/40"
                    }`}
                  >
                    <p className="font-medium text-white">
                      📄 {session.resume?.originalName || "Unknown Resume"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(session.createdAt)}
                    </p>

                    <div className="flex gap-2 flex-wrap mt-3">
                      {session.results?.map((result) => (
                        <span
                          key={result._id}
                          className="text-xs px-2 py-0.5 rounded-full bg-[#020817] border border-[#1e293b] text-slate-400"
                        >
                          {result.difficulty} · {result.atsScore}%
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Backend Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#020817] border border-[#1e293b] rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[#020817] border border-[#1e293b] rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                >
                  <option value="fresher">Fresher</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="senior">Senior</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                  Interview Type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full bg-[#020817] border border-[#1e293b] rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500"
                >
                  <option value="mixed">Mixed</option>
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="project-based">Project Based</option>
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedSessionId || !role}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-all"
              >
                {submitting ? "Starting Interview..." : "Start Interview"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default InterviewSetup;
