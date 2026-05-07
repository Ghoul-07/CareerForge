import { useState, useEffect } from "react";
import api from "../../api/api.js";
import { useNavigate } from "react-router-dom";

function InterviewSetup() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [selectedResultId, setSelectedResultId] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [expandedJDIds, setExpandedJDIs] = useState([]);

  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("fresher");
  const [interviewType, setInterviewType] = useState("mixed");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [interviews, setInterviews] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      try {
        setError("");
        const response = await api.get("/resume/history");
        setSessions(response.data.sessions);
      } catch (err) {
        setError("Something went wrong. Please try again");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  useEffect(() => {
    async function fetchInterviews() {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/interview");

        setInterviews(response.data.interviews);
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchInterviews();
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

    if (
      !selectedSessionId ||
      !selectedResultId ||
      !role ||
      !difficulty ||
      !interviewType
    ) {
      setError("Please provide all details");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const createRes = await api.post("/interview/create", {
        resumeAnalysisSessionId: selectedSessionId,
        resultId: selectedResultId,
        role,
        difficulty,
        interviewType,
      });

      const interviewId = createRes.data.interviewSession._id;

      const startRes = await api.post(`/interview/start/${interviewId}`, {});

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

  function handleSelectSession(sessionId, resultId) {
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
      setSelectedResultId(null);
    } else {
      setSelectedSessionId(sessionId);
      setSelectedResultId(resultId);
    }
  }

  function toggleJD(resultId) {
    setExpandedJDIs((prev) =>
      prev.includes(resultId)
        ? prev.filter((id) => id !== resultId)
        : [...prev, resultId],
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white py-10">
      <div className="w-full max-w-5xl mx-auto px-6">
        {interviews.length > 0 && (
          <div className="max-w-5xl mx-auto mb-10">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
              Resume Previous Interview
            </p>

            <div className="flex flex-col gap-4">
              {interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-white text-xl font-semibold">
                      {interview.role}
                    </h3>

                    <p className="text-white-400 text-sm mt-1">
                      Difficulty: {interview.difficulty}
                    </p>
                    <p className="text-white-400 text-sm mt-1">
                      InterviewType: {interview.interviewType}
                    </p>

                    <div className="flex gap-4 mt-3 text-sm text-slate-500">
                      <p>
                        Started:{" "}
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </p>

                      <p>
                        Progress: {interview.currentQuestionIndex}/
                        {interview.plan.questions.length}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/interview/${interview._id}`)}
                    className="bg-indigo-600 hover:bg-indigo-500 transition-all px-5 py-3 rounded-xl font-semibold text-white"
                  >
                    Resume
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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

              <div className="flex flex-col gap-4">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className="border border-[#1e293b] rounded-2xl bg-[#0f172a] overflow-hidden"
                  >
                    {/* Session Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSessionId(
                          expandedSessionId === session._id
                            ? null
                            : session._id,
                        )
                      }
                      className="w-full text-left p-5 hover:bg-[#111c33] transition-all"
                    >
                      <p className="font-semibold text-white text-lg">
                        📄 {session.resume?.originalName}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        {formatDate(session.createdAt)}
                      </p>

                      <div className="flex gap-2 flex-wrap mt-3">
                        {session.results.map((result) => (
                          <span
                            key={result._id}
                            className="text-xs px-2 py-0.5 rounded-full bg-[#020817] border border-[#1e293b] text-slate-400"
                          >
                            {result.difficulty} · {result.atsScore}%
                          </span>
                        ))}
                      </div>
                    </button>

                    {/* Expanded Results */}
                    {expandedSessionId === session._id && (
                      <div className="border-t border-[#1e293b] p-5 flex flex-col gap-4">
                        {session.results.map((result, index) => {
                          const isJDOpen = expandedJDIds.includes(result._id);
                          const isSelected = selectedResultId === result._id;

                          return (
                            <div
                              key={result._id}
                              className={`rounded-xl border p-4 transition-all ${
                                isSelected
                                  ? "border-indigo-500 bg-indigo-500/10"
                                  : "border-[#1e293b] bg-[#020817]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4 mb-3">
                                <div>
                                  <p className="font-semibold text-white">
                                    {result.difficulty} · {result.atsScore}%
                                    Match
                                  </p>

                                  <p className="text-xs text-slate-500 mt-1">
                                    Job Description #{index + 1}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSelectSession(session._id, result._id)
                                  }
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isSelected
                                      ? "bg-indigo-500 text-white"
                                      : "bg-[#0f172a] border border-[#1e293b] text-slate-300 hover:border-indigo-500"
                                  }`}
                                >
                                  {isSelected ? "Selected" : "Select"}
                                </button>
                              </div>

                              <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4">
                                <p
                                  className={`text-sm text-slate-400 whitespace-pre-wrap ${
                                    isJDOpen ? "" : "line-clamp-3"
                                  }`}
                                >
                                  {result.jobDescription}
                                </p>

                                <button
                                  type="button"
                                  onClick={() => toggleJD(result._id)}
                                  className="text-xs text-indigo-400 hover:text-indigo-300 mt-3"
                                >
                                  {isJDOpen ? "Hide JD" : "View Full JD"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
