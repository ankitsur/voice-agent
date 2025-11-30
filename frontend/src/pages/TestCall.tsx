// src/pages/TestCall.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { listAgentConfigs } from "../api/agentConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { RetellWebClient } from "retell-client-js-sdk";
import { startCall } from "../api/testCall";
import type { AgentConfig } from "../types";

export default function TestCall() {
  const navigate = useNavigate();

  // Agent configs
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState("");

  // Driver input fields
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [loadNumber, setLoadNumber] = useState("");

  // Retell call handling
  const retellClientRef = useRef<RetellWebClient | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callId, setCallId] = useState("");

  // -------------------------------------------
  // Load Agent Configurations
  // -------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await listAgentConfigs();
        setConfigs(res.data);
      } catch {
        toast.error("Failed to load agent configs.");
      }
      setLoadingConfigs(false);
    }
    load();
  }, []);

  // -------------------------------------------
  // Cleanup on unmount
  // -------------------------------------------
  useEffect(() => {
    return () => {
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
      }
    };
  }, []);

  // -------------------------------------------
  // Start Call Handler
  // -------------------------------------------
  async function handleStartCall() {
    if (!selectedConfig) {
      toast.error("Please select an agent configuration.");
      return;
    }
    if (!driverName || !driverPhone || !loadNumber) {
      toast.error("Please fill all fields.");
      return;
    }

    setIsCalling(true);

    try {
      // 1. Call backend /start-call to get access token
      const res = await startCall({
        agent_config_id: selectedConfig,
        driver_name: driverName,
        driver_phone: driverPhone,
        load_number: loadNumber,
      });

      const accessToken = res.access_token;
      const returnedCallId = res.call_id;

      if (!accessToken) {
        toast.error("No access token received from backend.");
        setIsCalling(false);
        return;
      }

      setCallId(returnedCallId);

      // 2. Initialize Retell Web Client (browser SDK)
      const client = new RetellWebClient();
      retellClientRef.current = client;

      // 3. Set up event listeners
      client.on("call_started", () => {
        console.log("Call started");
        toast.success("Call connected! Speak now...");
        setIsInCall(true);
      });

      client.on("call_ended", () => {
        console.log("Call ended");
        toast.success("Call finished!");
        setIsInCall(false);
        setIsCalling(false);
        // Navigate to results after a short delay
        setTimeout(() => {
          navigate(`/call-results/${returnedCallId}`);
        }, 1000);
      });

      client.on("agent_start_talking", () => {
        console.log("Agent started talking");
      });

      client.on("agent_stop_talking", () => {
        console.log("Agent stopped talking");
      });

      client.on("error", (error: Error) => {
        console.error("Call error:", error);
        toast.error(`Call error: ${error.message || "Unknown error"}`);
        setIsInCall(false);
        setIsCalling(false);
      });

      client.on("update", (update) => {
        // Optional: Handle real-time updates
        console.log("Update:", update);
      });

      // 4. Start the web call
      await client.startCall({
        accessToken: accessToken,
      });

    } catch (err) {
      console.error("Failed to start call:", err);
      toast.error("Failed to start call. Check console for details.");
      setIsCalling(false);
      setIsInCall(false);
    }
  }

  // -------------------------------------------
  // End Call Handler
  // -------------------------------------------
  function handleEndCall() {
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
      toast.success("Call ended.");
      setIsInCall(false);
      setIsCalling(false);
    }
  }

  // -------------------------------------------
  // Render UI
  // -------------------------------------------
  return (
    <div className="ml-64 mt-16 p-10">

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Start Test Call
      </h1>

      <p className="text-gray-600 dark:text-slate-400 mt-2 text-lg">
        Select an agent, enter driver details, and begin a Web Call. You will speak as the driver.
      </p>

      {/* Call Status Banner */}
      {isInCall && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-xl border border-green-500 flex items-center gap-4">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-800 dark:text-green-200 font-semibold">
            🎙️ Call in progress - Speak into your microphone as the driver
          </span>
        </div>
      )}

      {/* Agent Config Selector */}
      <section className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-lg">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          Select Agent Configuration
        </h2>

        {loadingConfigs ? (
          <p className="mt-3 text-gray-600 dark:text-slate-400">Loading...</p>
        ) : configs.length === 0 ? (
          <p className="mt-3 text-red-500">No agent configurations found.</p>
        ) : (
          <select
            className="mt-4 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-slate-100"
            value={selectedConfig}
            onChange={(e) => setSelectedConfig(e.target.value)}
            disabled={isInCall}
          >
            <option value="">Select config...</option>
            {configs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* Driver Details */}
      <section className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 shadow-lg">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          Driver & Load Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

          {/* Driver Name */}
          <div>
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Driver Name
            </label>
            <input
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="mt-2 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-slate-100"
              placeholder="Example: Mike Johnson"
              disabled={isInCall}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Driver Phone
            </label>
            <input
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              className="mt-2 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-slate-100"
              placeholder="+1 305 555 1983"
              disabled={isInCall}
            />
          </div>

          {/* Load Number */}
          <div>
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Load Number
            </label>
            <input
              value={loadNumber}
              onChange={(e) => setLoadNumber(e.target.value)}
              className="mt-2 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 dark:text-slate-100"
              placeholder="7891-B"
              disabled={isInCall}
            />
          </div>

        </div>
      </section>

      {/* Start & End Buttons */}
      <div className="mt-12 flex gap-4">
        {!isInCall ? (
          <button
            onClick={handleStartCall}
            disabled={isCalling}
            className="px-12 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-lg shadow-xl transition-colors"
          >
            {isCalling ? "Connecting..." : "Start Call"}
          </button>
        ) : (
          <button
            onClick={handleEndCall}
            className="px-12 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-lg shadow-xl transition-colors"
          >
            End Call
          </button>
        )}
      </div>


      {/* Instructions */}
      <section className="mt-10 p-6 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-slate-700">
        <h3 className="font-semibold text-blue-800 dark:text-blue-400">💡 How to Test</h3>
        <ul className="mt-3 text-gray-700 dark:text-slate-300 space-y-2">
          <li>1. Select an agent configuration (e.g., "Dispatch Check-in Agent")</li>
          <li>2. Enter driver details (name, phone, load number)</li>
          <li>3. Click "Start Call" and allow microphone access when prompted</li>
          <li>4. <strong>Speak as if you are the driver</strong> responding to dispatch</li>
          <li>5. When done, click "End Call" or let the agent end the conversation</li>
          <li>6. View the structured results on the Call Results page</li>
        </ul>
      </section>
    </div>
  );
}
