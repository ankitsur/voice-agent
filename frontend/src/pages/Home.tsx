// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className=" ml-64  flex flex-col w-full h-full p-10">
      {/* Title */}
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
        Welcome to the Customizable AI Voice Agent Dashboard
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
        Configure your AI agent, run test calls, and review structured call outcomes — all in one place.
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">

        <div
          onClick={() => navigate("/agent-configs/new")}
          className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 
          dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Configure Agent
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Define prompts, voice settings, and logic for your agent.
          </p>
        </div>

        <div
          onClick={() => navigate("/test-call")}
          className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 
          dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Start Call
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter driver details and simulate a real AI phone call.
          </p>
        </div>

        <div
          onClick={() => navigate("/call-results")}
          className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 
          dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Call Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View structured summaries and full transcripts.
          </p>
        </div>

      </div>
    </div>
  );
}
