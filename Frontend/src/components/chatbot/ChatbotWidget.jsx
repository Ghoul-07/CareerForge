import { useEffect, useState, useRef } from "react";
import api from "../../api/api";

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [latestInterview, setLatestInterview] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(true);

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
    async function fetchLatestInterview() {
      try {
        setInterviewLoading(true);

        const res = await api.get("/interview/history");

        const completed = res.data.interviews.filter(
          (interview) =>
            interview.status === "finished" &&
            interview.finalReport &&
            interview.finalReport.overallScore !== null,
        );

        setLatestInterview(completed[0] || null);
      } catch (err) {
        console.log(err);
      } finally {
        setInterviewLoading(false);
      }
    }

    fetchLatestInterview();
  }, []);

  async function handleAsk(e) {
    e.preventDefault();

    if (!question.trim()) return;

    if (interviewLoading) {
      setError("Loading your interview context. Please try again in a moment.");
      return;
    }

    if (!latestInterview) {
      setError("Finish at least one interview before using the assistant.");
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
        contextType: "interview",
        contextId: latestInterview._id,
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

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // save chat
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
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#1e293b] flex items-start justify-between">
            <div>
              <p className="text-white font-semibold">Career Assistant</p>

              <p className="text-xs text-slate-500 mt-1">
                {interviewLoading
                  ? "Loading your latest interview context..."
                  : latestInterview
                    ? "Using your latest completed interview as context"
                    : "Finish an interview to unlock personalized help"}
              </p>
            </div>

            <button
              onClick={() => {
                const initial = [
                  {
                    role: "assistant",
                    text: "Hey! I can help you understand your interview feedback and suggest improvements.",
                  },
                ];

                setMessages(initial);

                localStorage.removeItem("careerforge_chat_messages");
              }}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white self-end max-w-[85%]"
                    : "bg-[#020817] border border-[#1e293b] text-slate-300 self-start max-w-[90%]"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
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
              disabled={loading || interviewLoading || !question.trim()}
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
