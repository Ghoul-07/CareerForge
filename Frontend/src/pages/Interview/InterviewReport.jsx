import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/api.js";

function InterviewReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [finalReport, setFinalReport] = useState(
    location.state?.finalReport || null,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      if (finalReport) return;

      try {
        setLoading(true);
        const response = await api.get(`/interview/${id}`);

        if (response.data.interviewSession.status !== "finished") {
          setError("This Interview is not finished yet");
          return;
        }

        setFinalReport(response.data.interviewSession.finalReport);
      } catch (err) {
        setError("something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!finalReport) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex items-center justify-center px-6">
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Report not found</h1>
          <p className="text-slate-400 text-sm mb-6">
            Finish an interview first to generate a report.
          </p>

          <button
            onClick={() => navigate("/interview/setup")}
            className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-semibold"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  const scoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white py-10">
      <div className="w-full max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-2">
            Interview Report
          </p>

          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Final Performance Report
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Here’s how you performed in this mock interview.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
              Overall Score
            </p>
            <p
              className={`text-5xl font-bold ${scoreColor(finalReport.overallScore)}`}
            >
              {finalReport.overallScore}/10
            </p>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
              Technical Score
            </p>
            <p
              className={`text-5xl font-bold ${scoreColor(finalReport.technicalScore)}`}
            >
              {finalReport.technicalScore}/10
            </p>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
              Communication Score
            </p>
            <p
              className={`text-5xl font-bold ${scoreColor(
                finalReport.communicationScore,
              )}`}
            >
              {finalReport.communicationScore}/10
            </p>
          </div>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-6">
          <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">
            Final Verdict
          </p>
          <p className="text-xl font-semibold text-white">
            {finalReport.finalVerdict}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
            <p className="text-xs font-mono text-green-400 uppercase tracking-widest mb-4">
              Strengths
            </p>

            <ul className="space-y-3">
              {finalReport.strengths?.map((item, index) => (
                <li key={index} className="text-sm text-slate-300 flex gap-3">
                  <span className="text-green-400">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
            <p className="text-xs font-mono text-yellow-400 uppercase tracking-widest mb-4">
              Weak Areas
            </p>

            <ul className="space-y-3">
              {finalReport.weakAreas?.map((item, index) => (
                <li key={index} className="text-sm text-slate-300 flex gap-3">
                  <span className="text-yellow-400">⚠</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 mb-8">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4">
            Recommended Topics
          </p>

          <div className="flex flex-wrap gap-2">
            {finalReport.recommendedTopics?.map((topic, index) => (
              <span
                key={index}
                className="bg-[#020817] border border-[#1e293b] text-slate-300 text-sm px-3 py-1 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/interview/setup")}
            className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-semibold"
          >
            Start Another Interview
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#0f172a] border border-[#1e293b] hover:border-indigo-500/50 px-5 py-3 rounded-xl font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewReport;
