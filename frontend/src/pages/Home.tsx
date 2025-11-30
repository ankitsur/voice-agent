// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="ml-64 mt-16 p-10 pr-10 max-w-[calc(100vw-16rem)]">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
        AI Voice Agent Dashboard
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
        Configure your AI agent, run test calls, and review structured call outcomes.
      </p>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-6 mt-10">
        <div
          onClick={() => navigate("/agent-configs")}
          className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 
          dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
        >
          <div className="text-3xl mb-3">⚙️</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Configure Agent
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Define prompts, emergency triggers, and extraction rules.
          </p>
        </div>

        <div
          onClick={() => navigate("/test-call")}
          className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 
          dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
        >
          <div className="text-3xl mb-3">📞</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Start Call
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            Enter driver details and start a test web call.
          </p>
        </div>

        <div
          onClick={() => navigate("/call-results")}
          className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 
          dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
        >
          <div className="text-3xl mb-3">📊</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Call Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
            View structured summaries and transcripts.
          </p>
        </div>
      </div>
    </div>
  );
}
