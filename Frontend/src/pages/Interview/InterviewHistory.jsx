import api from "../../api/api.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isJDOpen, setIsJDOpen] = useState([]);

  function toggleJD(id) {}
  const navigate = useNavigate();

  useEffect(() => {
    async function getInterviews() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/interview/history");
        setInterviews(response.data.interviews);
      } catch (err) {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    getInterviews();
  }, []);

  const inProgressInterviews = interviews.filter(
    (i) => i.status === "in_progress",
  );

  const completedInterviews = interviews.filter((i) => i.status === "finished");

  const createdInterviews = interviews.filter((i) => i.status === "created");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white py-10">
      <div className="w-full max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-2">
            Interview History
          </p>
          <h1 className="text-3xl font-bold">Your Interviews</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Resume unfinished interviews or review completed interview reports.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            {error}
          </p>
        )}

        <div className="mb-8">
          <button
            onClick={() => navigate("/interview/setup")}
            className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-semibold"
          >
            Start New Interview
          </button>
        </div>

        <InterviewSection
          title="In Progress"
          emptyText="No interviews currently in progress."
          interviews={inProgressInterviews}
          actionLabel="Resume"
          onAction={(id) => navigate(`/interview/${id}`)}
        />

        <InterviewSection
          title="Completed"
          emptyText="No completed interviews yet."
          interviews={completedInterviews}
          actionLabel="View Report"
          onAction={(id) => {
            navigate(`/interview/${id}/report`);
          }}
        />

        <InterviewSection
          title="Not Started"
          emptyText="No created interviews waiting to start."
          interviews={createdInterviews}
          actionLabel="Start"
          onAction={(id) => navigate(`/interview/${id}`)}
        />
      </div>
    </div>
  );
}

function InterviewSection({
  title,
  emptyText,
  interviews,
  actionLabel,
  onAction,
}) {
  return (
    <section className="mb-10">
      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
        {title}
      </p>

      {interviews.length === 0 ? (
        <div className="bg-[#0f172a] border border-dashed border-[#1e293b] rounded-2xl p-6">
          <p className="text-slate-500 text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span>📄</span>

                    {interview.resume?.url ? (
                      <a
                        href={interview.resume.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white font-medium hover:text-indigo-400 underline underline-offset-4 truncate"
                      >
                        {interview.resume?.originalName || "View Resume"}
                      </a>
                    ) : (
                      <span className="text-white font-medium">
                        {interview.resume?.originalName || "Unknown Resume"}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {interview.role}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      {interview.difficulty}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#020817] border border-[#1e293b] text-slate-400">
                      {interview.interviewType}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#020817] border border-[#1e293b] text-slate-400">
                      {interview.status}
                    </span>
                  </div>

                  {interview.jobDescription && (
                    <div className="bg-[#020817] border border-[#1e293b] rounded-xl p-4 mb-4">
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                        Job Description
                      </p>
                      <p className="text-sm text-slate-400 line-clamp-3">
                        {interview.jobDescription}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <p>
                      Progress:{" "}
                      <span className="text-white">
                        {interview.currentQuestionIndex}/
                        {interview.totalQuestions}
                      </span>
                    </p>

                    {interview.overallScore && (
                      <p>
                        Overall:{" "}
                        <span className="text-indigo-400 font-semibold">
                          {interview.overallScore}/10
                        </span>
                      </p>
                    )}

                    {interview.atsScore && (
                      <p>
                        Resume Match:{" "}
                        <span className="text-indigo-400 font-semibold">
                          {interview.atsScore}%
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onAction(interview._id)}
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-semibold transition-all"
                >
                  {actionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default InterviewHistory;
