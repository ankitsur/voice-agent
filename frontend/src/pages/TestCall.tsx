/* eslint-disable */
// @ts-nocheck

import { useEffect, useState } from "react";
import { listAgentConfigs } from "../api/agentConfig";
// import { startCall } from "../api/startCall";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Retell from "retell-sdk";   // ✅ Correct import
import { startCall } from "../api/testCall";



export default function TestCall() {
  const navigate = useNavigate();

  // Agent configs
  const [configs, setConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState("");

  // Driver input fields
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [loadNumber, setLoadNumber] = useState("");

  // Retell call handling
  const [retellClient, setRetellClient] = useState<any>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callId, setCallId] = useState("");

  // -------------------------------------------
  // Load Agent Configurations
  // -------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await listAgentConfigs();
        setConfigs(res.data);
      } catch (error) {
        toast.error("Failed to load agent configs.");
      }
      setLoadingConfigs(false);
    }
    load();
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
      // 1. Call backend /start-call
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

      // 2. Initialize Retell Web Call Client
      const client = new Retell.WebCallClient();   // ✅ Correct class
      setRetellClient(client);

      toast.success("Starting Web Call...");

      // 3. Start Web Call
      await client.startCall({
        accessToken,
        onAgentMessage: (msg) => console.log("Agent:", msg),
        onUserMessage: (msg) => console.log("User:", msg),

        onError: (err) => {
          console.error("Call error:", err);
          toast.error("Call encountered an error.");
        },

        onEnd: () => {
          console.log("Call ended.");
          toast.success("Call finished.");
          navigate(`/call-results/${returnedCallId}`);
        },
      });

    } catch (error) {
      console.error(error);
      toast.error("Call failed to start.");
    }

    setIsCalling(false);
  }

  // -------------------------------------------
  // Manual End Call Button (optional)
  // -------------------------------------------
  function handleEndCall() {
    if (retellClient) {
      retellClient.stopCall();
      toast.success("Call ended manually.");
    }
  }

  // -------------------------------------------
  // Render UI
  // -------------------------------------------
  return (
    <div className="ml-64 mt-16 p-10">

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Start Call
      </h1>

      <p className="text-gray-600 dark:text-slate-400 mt-2 text-lg">
        Select an agent, enter driver details, and begin a simulated Web Call.
      </p>

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
            />
          </div>

        </div>
      </section>

      {/* Start & End Buttons */}
      <div className="mt-12 flex gap-4">
        <button
          onClick={handleStartCall}
          disabled={isCalling}
          className="px-12 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-lg shadow-xl"
        >
          {isCalling ? "Starting Call..." : "Start Call"}
        </button>

        {retellClient && (
          <button
            onClick={handleEndCall}
            className="px-12 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-lg shadow-xl"
          >
            End Call
          </button>
        )}
      </div>

      {/* Show call_id */}
      {callId && (
        <p className="mt-6 text-green-500 dark:text-green-300">
          Call ID: <strong>{callId}</strong>
        </p>
      )}
    </div>
  );
}
