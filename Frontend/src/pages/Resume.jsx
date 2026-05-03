import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Resume() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

      const response = await axios.post(
        "http://localhost:3000/api/resume/analyze",
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setAnalysis(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white py-10">
      <div className="w-full max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-2">
            Phase 2
          </p>
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Resume Analyzer
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Upload your resume and paste the job description to get an ATS score
            and improvement suggestions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mb-10">
          {/* File upload */}
          <div className="bg-[#0f172a] border border-dashed border-[#334155] rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-500 transition-all">
            <span className="text-3xl">📄</span>
            <p className="text-slate-400 text-sm">
              {resumeFile
                ? resumeFile.name
                : "Click to upload your resume (PDF)"}
            </p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              id="resumeInput"
              onChange={(e) => setResumeFile(e.target.files[0])}
            />
            <label
              htmlFor="resumeInput"
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all"
            >
              Choose File
            </label>
          </div>

          {/* JD textarea */}
          <textarea
            placeholder="Paste the job description here..."
            name="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            className="bg-[#0f172a] border border-[#1e293b] text-white rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500 resize-none text-sm"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !resumeFile || !jobDescription}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
          >
            {loading ? "Analyzing..." : "Analyze Resume →"}
          </button>
        </form>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 font-mono text-sm tracking-widest">
              AI IS ANALYZING YOUR RESUME...
            </p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="flex flex-col gap-6">
            {/* ATS Score */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 flex items-center gap-6">
              <div
                className="text-5xl font-bold"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: scoreColor(analysis.atsScore),
                }}
              >
                {analysis.atsScore}
              </div>
              <div>
                <p className="text-xs font-mono tracking-widest text-slate-500 uppercase mb-1">
                  ATS Score
                </p>
                <p className="text-slate-300 text-sm">
                  {analysis.atsScore >= 80
                    ? "Great match! Your resume aligns well with the JD."
                    : analysis.atsScore >= 60
                      ? "Decent match. Some improvements needed."
                      : "Low match. Significant gaps found."}
                </p>
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest font-mono">
                Missing Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Weak Points */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest font-mono">
                Weak Points
              </h2>
              <ul className="flex flex-col gap-3">
                {analysis.weakPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-3 items-start text-sm text-slate-400"
                  >
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improved Points */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6">
              <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest font-mono">
                Improved Suggestions
              </h2>
              <ul className="flex flex-col gap-3">
                {analysis.improvedPoints.map((point, i) => (
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
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-indigo-400 mb-3 uppercase tracking-widest font-mono">
                Overall Feedback
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                {analysis.overallFeedback}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Resume;
