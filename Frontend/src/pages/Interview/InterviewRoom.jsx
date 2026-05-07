import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import api from "../../api/api.js";
import { useEffect } from "react";

function InterviewRoom() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(
    location.state?.firstQuestion || null,
  );

  const [totalQuestions, setTotalQuestions] = useState(
    location.state?.totalQuestions || 0,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);

  const [nextQuestion, setNextQuestion] = useState(null);
  const [nextQuestionIndex, setNextQuestionIndex] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [canFinish, setCanFinish] = useState(false);
  const [error, setError] = useState("");

  const answeredCount = evaluation
    ? currentQuestionIndex + 1
    : currentQuestionIndex;

  const progressPercent = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  useEffect(() => {
    async function fetchInterview() {
      try {
        const response = await api.get(`/interview/${id}`);

        setCurrentQuestion(response.data.currentQuestion);
        setTotalQuestions(response.data.totalQuestions);
        setCurrentQuestionIndex(response.data.currentQuestionIndex);
        setCanFinish(response.data.canFinish);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load interview");
      }
    }
    fetchInterview();
  }, [id]);

  async function handleSubmitAnswer(e) {
    e.preventDefault();

    if (!answer.trim()) {
      setError("Please write an answer first");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(`/interview/answer/${id}`, { answer });

      setEvaluation(response.data.evaluation || null);
      setAnswer("");

      if (response.data.nextQuestion) {
        setNextQuestion(response.data.nextQuestion);
        setNextQuestionIndex(response.data.currentQuestionIndex);
      } else {
        setNextQuestion(null);
        setNextQuestionIndex(null);
        setCanFinish(true);
      }
    } catch (err) {
      setError("Something went wrong. Please try again");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNextQuestion() {
    setCurrentQuestion(nextQuestion);
    setCurrentQuestionIndex(nextQuestionIndex);
    setNextQuestion(null);
    setNextQuestionIndex(null);
    setEvaluation(null);
    setAnswer("");
    setError("");
  }

  async function handleFinishInterview() {
    try {
      setSubmitting(true);
      setError("");

      const response = await api.post(`/interview/finish/${id}`, {});

      navigate(`/interview/${id}/report`, {
        state: {
          finalReport: response.data.finalReport,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to finish interview");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white py-10">
      <div className="w-full max-w-5xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-2">
            Interview Simulator
          </p>

          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Mock Interview
          </h1>

          <p className="text-slate-400 mt-2 text-sm">
            Answer each question like you would in a real interview.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>
              Question {Math.min(currentQuestionIndex + 1, totalQuestions)} of{" "}
              {totalQuestions}
            </span>
            <span>{progressPercent}%</span>
          </div>

          <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {currentQuestion && !canFinish && (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 mb-6">
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                {currentQuestion.category}
              </span>

              <span className="text-xs px-2 py-0.5 rounded-full bg-[#020817] border border-[#1e293b] text-slate-400">
                {currentQuestion.difficulty}
              </span>
            </div>

            <h2 className="text-2xl font-semibold leading-snug">
              {currentQuestion.question}
            </h2>

            {currentQuestion.whyAsked && (
              <p className="text-slate-400 text-sm mt-4">
                <span className="text-indigo-400">Why asked:</span>{" "}
                {currentQuestion.whyAsked}
              </p>
            )}
          </div>
        )}

        {canFinish && (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-8 mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">
              All questions answered 🎉
            </h2>
            <p className="text-slate-400 text-sm">
              Finish the interview to generate your final report.
            </p>
          </div>
        )}

        {evaluation && (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono text-indigo-400 uppercase tracking-widest">
                Feedback
              </p>
              <span className="text-lg font-bold text-white">
                Score: {evaluation.score}/10
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-mono text-green-400 uppercase tracking-widest mb-2">
                  Strengths
                </p>
                <ul className="space-y-2">
                  {evaluation.strengths?.map((item, index) => (
                    <li key={index} className="text-sm text-slate-300">
                      ✓ {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-mono text-yellow-400 uppercase tracking-widest mb-2">
                  Weaknesses
                </p>
                <ul className="space-y-2">
                  {evaluation.weaknesses?.map((item, index) => (
                    <li key={index} className="text-sm text-slate-300">
                      ⚠ {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-[#020817] border border-[#1e293b] rounded-xl p-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
                Improved Answer
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {evaluation.improvedAnswer}
              </p>
            </div>

            {evaluation.followUpQuestion && (
              <p className="text-sm text-indigo-300 mt-4">
                Follow-up: {evaluation.followUpQuestion}
              </p>
            )}
          </div>
        )}

        {currentQuestion && !evaluation && !canFinish && (
          <form onSubmit={handleSubmitAnswer} className="flex flex-col gap-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={7}
              className="w-full bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 text-white outline-none focus:border-indigo-500 resize-none"
            />

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-all"
            >
              {submitting ? "Submitting..." : "Submit Answer"}
            </button>
          </form>
        )}

        {nextQuestion && evaluation && (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl py-3 font-semibold transition-all"
          >
            Next Question
          </button>
        )}

        {canFinish && (
          <button
            onClick={handleFinishInterview}
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl py-3 font-semibold transition-all"
          >
            {submitting ? "Generating Report..." : "Finish Interview"}
          </button>
        )}

        {error && !currentQuestion && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mt-4">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default InterviewRoom;
