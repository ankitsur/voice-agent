// src/pages/CallDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getCall, CallData } from "../api/calls";

export default function CallDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [call, setCall] = useState<CallData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const res = await getCall(id!);
        setCall(res.data);
      } catch (error) {
        toast.error("Failed to load call details.");
      }
      setLoading(false);
    }
    load();
  }, [id]);

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

  if (loading) {
    return (
      <div className="ml-64 mt-16 p-10 text-gray-600 dark:text-slate-400">
        Loading call details...
      </div>
    );
  }

  if (!call) {
    return (
      <div className="ml-64 mt-16 p-10">
        <p className="text-red-500">Call not found.</p>
        <button
          onClick={() => navigate("/call-results")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Call Results
        </button>
      </div>
    );
  }

  const structuredData = call.structured_data || {};
  const hasStructuredData = Object.keys(structuredData).length > 0;

  return (
    <div className="ml-64 mt-16 p-10 pb-24">
      {/* Back Button */}
      <button
        onClick={() => navigate("/call-results")}
        className="mb-6 text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-2"
      >
        ← Back to Call Results
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Call Details
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            {call.driver_name} • Load #{call.load_number}
          </p>
        </div>
        {getStatusBadge(call.status)}
      </div>

      {/* Call Info Card */}
      <section className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-4">
          Call Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Driver Name</p>
            <p className="text-gray-900 dark:text-white font-medium">{call.driver_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Phone</p>
            <p className="text-gray-900 dark:text-white font-medium">{call.driver_phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Load Number</p>
            <p className="text-gray-900 dark:text-white font-medium">{call.load_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Duration</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {call.started_at && call.ended_at
                ? `${Math.round((new Date(call.ended_at).getTime() - new Date(call.started_at).getTime()) / 1000)}s`
                : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Structured Data Card */}
      <section className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-4">
          Extracted Data Summary
        </h2>

        {!hasStructuredData ? (
          <p className="text-gray-500 dark:text-slate-400">
            {call.status === "completed"
              ? "No structured data was extracted from this call."
              : "Structured data will appear here once the call is completed."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(structuredData).map(([key, value]) => (
              <div
                key={key}
                className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700"
              >
                <p className="text-sm text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-gray-900 dark:text-white font-medium mt-1">
                  {value === null || value === undefined
                    ? "—"
                    : typeof value === "boolean"
                    ? value
                      ? "✓ Yes"
                      : "✗ No"
                    : String(value)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Transcript Card */}
      <section className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400 mb-4">
          Full Transcript
        </h2>

        {!call.transcript && (!call.transcript_object || call.transcript_object.length === 0) ? (
          <p className="text-gray-500 dark:text-slate-400">
            {call.status === "completed"
              ? "No transcript available for this call."
              : "Transcript will appear here once the call is completed."}
          </p>
        ) : call.transcript_object && call.transcript_object.length > 0 ? (
          <div className="space-y-3">
            {call.transcript_object.map((segment, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  segment.role === "agent"
                    ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500"
                    : "bg-gray-50 dark:bg-slate-900 border-l-4 border-gray-400"
                }`}
              >
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">
                  {segment.role === "agent" ? "🤖 Agent" : "👤 User"}
                </p>
                <p className="text-gray-900 dark:text-white">{segment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border dark:border-slate-700">
            <pre className="text-gray-900 dark:text-white whitespace-pre-wrap font-mono text-sm">
              {call.transcript}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}

