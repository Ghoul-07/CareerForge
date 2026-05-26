import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import api from "../../api/api";

function ChatbotWidget() {
  const [open, setOpen] = useState(false);

  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [contextLoading, setContextLoading] = useState(true);

  const [contextType, setContextType] = useState("interview");
  const [selectedContextId, setSelectedContextId] = useState("");

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("careerforge_chat_messages");

    return saved
      ? JSON.parse(saved)
      : [
          {
            role: "assistant",
            text: "Hey! I can help you understand your interview feedback and suggest improvements.",
          },
        ];
  });

  const messagesEndRef = useRef(null);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchContexts() {
      try {
        setContextLoading(true);

        const [interviewRes, resumeRes] = await Promise.all([
          api.get("/interview/history"),
          api.get("/resume/history"),
        ]);

        const finishedInterviews = interviewRes.data.interviews.filter(
          (interview) =>
            interview.status === "finished" &&
            interview.finalReport &&
            interview.finalReport.overallScore !== null,
        );

        const resumeSessions = resumeRes.data.sessions || [];

        setInterviews(finishedInterviews);
        setResumes(resumeSessions);

        if (finishedInterviews.length > 0) {
          setSelectedContextId(finishedInterviews[0]._id);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setContextLoading(false);
      }
    }

    fetchContexts();
  }, []);

  async function handleAsk(e) {
    e.preventDefault();

    if (!question.trim()) return;

    if (contextLoading) {
      setError("Loading your context. Please try again in a moment.");
      return;
    }

    if (!selectedContextId) {
      setError("Please select a resume analysis or completed interview first.");
      return;
    }

    const currentQuestion = question;

    const userMessage = {
      role: "user",
      text: currentQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/chatbot/ask", {
        contextType,
        contextId: selectedContextId,
        question: currentQuestion,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.data.answer,
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get assistant reply");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    const initial = [
      {
        role: "assistant",
        text: "Hey! I can help you understand your interview feedback and suggest improvements.",
      },
    ];

    setMessages(initial);
    setContextType("interview");
    localStorage.removeItem("careerforge_chat_messages");
  }

  function handleContextTypeChange(type) {
    setContextType(type);
    setError("");

    if (type === "interview") {
      setSelectedContextId(interviews[0]?._id || "");
    } else {
      setSelectedContextId(resumes[0]?._id || "");
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem("careerforge_chat_messages", JSON.stringify(messages));
  }, [messages]);

  return (
    <>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[80vh] bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#1e293b] flex items-start justify-between">
            <div>
              <p className="text-white font-semibold">Career Assistant</p>

              <p className="text-xs text-slate-500 mt-1">
                {contextLoading
                  ? "Loading your resume and interview contexts..."
                  : selectedContextId
                    ? `Using selected ${contextType} context`
                    : "Select a resume or completed interview to begin"}
              </p>
            </div>

            <button
              onClick={clearChat}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="p-4 border-b border-[#1e293b] bg-[#020817]/40 flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleContextTypeChange("interview")}
                className={`flex-1 text-xs rounded-lg py-2 border transition-all ${
                  contextType === "interview"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-[#020817] border-[#1e293b] text-slate-400 hover:border-indigo-500/40"
                }`}
              >
                Interview
              </button>

              <button
                type="button"
                onClick={() => handleContextTypeChange("resume")}
                className={`flex-1 text-xs rounded-lg py-2 border transition-all ${
                  contextType === "resume"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-[#020817] border-[#1e293b] text-slate-400 hover:border-indigo-500/40"
                }`}
              >
                Resume
              </button>
            </div>

            <select
              value={selectedContextId}
              onChange={(e) => setSelectedContextId(e.target.value)}
              disabled={contextLoading}
              className="w-full bg-[#020817] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
            >
              {contextType === "interview" ? (
                interviews.length > 0 ? (
                  interviews.map((interview) => (
                    <option key={interview._id} value={interview._id}>
                      {interview.role} · {interview.interviewType} ·{" "}
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </option>
                  ))
                ) : (
                  <option value="">No completed interviews</option>
                )
              ) : resumes.length > 0 ? (
                resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.resume?.originalName || "Resume Analysis"} ·{" "}
                    {resume.results?.length || 0} JD(s)
                  </option>
                ))
              ) : (
                <option value="">No resume analyses</option>
              )}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white self-end max-w-[85%]"
                    : "bg-[#020817] border border-[#1e293b] text-slate-300 self-start max-w-[85%]"
                }`}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="whitespace-pre-wrap leading-relaxed mb-2">
                        {children}
                      </p>
                    ),
                    li: ({ children }) => (
                      <li className="ml-4 list-disc mb-1">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-white">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))}

            {loading && (
              <div className="bg-[#020817] border border-[#1e293b] text-slate-400 rounded-xl px-4 py-3 text-sm self-start">
                Thinking...
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleAsk}
            className="p-4 border-t border-[#1e293b] flex gap-2"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask how to improve..."
              className="flex-1 bg-[#020817] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            />

            <button
              disabled={
                loading ||
                contextLoading ||
                !selectedContextId ||
                !question.trim()
              }
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 rounded-xl text-sm font-semibold text-white"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
