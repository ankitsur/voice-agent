// src/pages/CallResults.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { listCalls, CallData } from "../api/calls";

export default function CallResults() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await listCalls();
        setCalls(res.data || []);
      } catch (error) {
        toast.error("Failed to load calls.");
      }
      setLoading(false);
    }
    load();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      queued: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.queued}`}>
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  return (
    <div className="ml-64 mt-16 p-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Call Results
      </h1>
      <p className="text-gray-600 dark:text-slate-400 mt-2 text-lg">
        View all calls with their transcripts and structured summaries.
      </p>

      {loading ? (
        <div className="mt-10 text-gray-600 dark:text-slate-400">Loading calls...</div>
      ) : calls.length === 0 ? (
        <div className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-lg">
          <p className="text-gray-600 dark:text-slate-400">
            No calls yet. Go to{" "}
            <button
              onClick={() => navigate("/test-call")}
              className="text-blue-600 hover:underline"
            >
              Start Call
            </button>{" "}
            to make your first test call.
          </p>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Driver
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Load #
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Started
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {calls.map((call) => (
                <tr
                  key={call.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-gray-900 dark:text-white font-medium">
                      {call.driver_name}
                    </div>
                    <div className="text-gray-500 dark:text-slate-400 text-sm">
                      {call.driver_phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {call.load_number}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(call.status)}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">
                    {call.started_at
                      ? new Date(call.started_at).toLocaleString()
                      : call.created_at
                      ? new Date(call.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/call-results/${call.id}`)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

