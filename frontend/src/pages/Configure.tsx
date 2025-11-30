// src/pages/Configure.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createAgentConfig,
  updateAgentConfig,
  getAgentConfig,
} from "../api/agentConfig";

interface ConfigData {
  prompt?: string;
  first_message?: string;
  post_call_summary?: string;
  emergency?: {
    enabled?: boolean;
    triggers?: string[];
  };
}

interface ConfigureProps {
  viewOnly?: boolean;
}

export default function Configure({ viewOnly = false }: ConfigureProps) {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Agent Identity
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");

  // First Message (Opening line)
  const [firstMessage, setFirstMessage] = useState(
    "Hi {{driver_name}}, this is Dispatch calling with a check call on load {{load_number}}. How's everything going out there?"
  );

  // Main Prompt
  const [prompt, setPrompt] = useState(
    `You are an AI dispatch agent for a logistics company. Your job is to conduct driver check-in calls.

STANDARD CHECK-IN:
- Ask for current status (driving, arrived, unloading, delayed)
- Ask for current location
- Ask for estimated time of arrival (ETA)
- If delayed, ask for the reason

POD REMINDER:
- If driver has arrived or is unloading, remind them to send Proof of Delivery

EMERGENCY DETECTION:
- Emergency trigger words: {{emergency_triggers}}
- If driver mentions ANY of these words, immediately switch to emergency protocol
- In emergency mode: ask about safety, injuries, location, and whether the load is secure
- Inform them you're connecting them to a human dispatcher

Keep responses conversational and professional.`
  );

  // Post-Call Summary Prompt
  const [postCallSummary, setPostCallSummary] = useState(
    `Extract the following from the conversation as JSON:
- call_outcome: "In-Transit Update" | "Arrival Confirmation" | "Emergency Escalation"
- driver_status: "Driving" | "Delayed" | "Arrived" | "Unloading" | "Unknown"
- current_location: string or null
- eta: string or null
- delay_reason: string or null`
  );

  // Emergency Handling
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [emergencyTriggers, setEmergencyTriggers] = useState([
    "accident",
    "blowout",
    "breakdown",
    "emergency",
    "hurt",
    "injured",
    "crash",
    "medical",
  ]);
  const [newTrigger, setNewTrigger] = useState("");

  
  // Load config in edit mode
  useEffect(() => {
    if (!isEdit || !id) return;

    async function load() {
      setLoading(true);
      try {
        if (!id) throw new Error("No agent id provided");
        const res = await getAgentConfig(id as string);
        const data = res.data;

        setAgentName(data.name);
        setAgentDescription(data.description || "");

        const c = data.config as ConfigData;
        setPrompt(c.prompt || "");
        setFirstMessage(c.first_message || "");
        setPostCallSummary(c.post_call_summary || "");
        setEmergencyEnabled(c.emergency?.enabled ?? true);
        setEmergencyTriggers(c.emergency?.triggers || []);
      } catch {
        toast.error("Failed to load config");
      }
      setLoading(false);
    }

    load();
  }, [id, isEdit]);

  // Save config
  const handleSave = async () => {
    if (!agentName.trim()) {
      toast.error("Please enter an agent name");
      return;
    }

    setSaving(true);

    const payload = {
      name: agentName,
      description: agentDescription,
      config: {
        prompt,
        first_message: firstMessage,
        post_call_summary: postCallSummary,
        emergency: {
          enabled: emergencyEnabled,
          triggers: emergencyTriggers,
        },
      },
    };

    try {
      if (isEdit && id) {
        await updateAgentConfig(id, payload);
        toast.success("Configuration updated!");
      } else {
        await createAgentConfig(payload);
        toast.success("Configuration created!");
      }
      navigate("/agent-configs");
    } catch {
      toast.error("Failed to save configuration.");
    }

    setSaving(false);
  };

  const addTrigger = () => {
    const trimmed = newTrigger.trim().toLowerCase();
    if (!trimmed) return;
    if (emergencyTriggers.includes(trimmed)) {
      toast.error("Trigger already exists");
      return;
    }
    setEmergencyTriggers([...emergencyTriggers, trimmed]);
    setNewTrigger("");
  };

  const removeTrigger = (trigger: string) => {
    setEmergencyTriggers(emergencyTriggers.filter((t) => t !== trigger));
  };

  if (loading) {
    return (
      <div className="ml-64 mt-20 p-10 text-gray-700 dark:text-gray-200">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="ml-64 mt-16 p-10 pb-24 max-w-4xl">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {viewOnly ? "View Agent Configuration" : isEdit ? "Edit Agent Configuration" : "Create Agent Configuration"}
      </h1>
      <p className="text-gray-600 dark:text-slate-400 mt-2">
        {viewOnly ? "Viewing the agent configuration details." : "Configure the AI agent's behavior for driver check-in calls."}
      </p>

      {/* Agent Identity */}
      <section className="mt-8 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700">
        <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          Agent Identity
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block font-medium text-gray-800 dark:text-slate-100 mb-1">
              Agent Name *
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              disabled={viewOnly}
              className={`p-3 w-full rounded-lg border text-gray-900 dark:text-slate-100 ${
                viewOnly 
                  ? "bg-gray-100 dark:bg-slate-800 cursor-not-allowed" 
                  : "bg-gray-50 dark:bg-slate-900"
              } dark:border-slate-700`}
              placeholder="e.g., Dispatch Check-in Agent"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-800 dark:text-slate-100 mb-1">
              Description
            </label>
            <input
              type="text"
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              disabled={viewOnly}
              className={`p-3 w-full rounded-lg border text-gray-900 dark:text-slate-100 ${
                viewOnly 
                  ? "bg-gray-100 dark:bg-slate-800 cursor-not-allowed" 
                  : "bg-gray-50 dark:bg-slate-900"
              } dark:border-slate-700`}
              placeholder="Brief description of what this agent does"
            />
          </div>
        </div>
      </section>

      {/* First Message */}
      <section className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700">
        <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          First Message
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          The opening line the agent says when the call connects. Use {"{{driver_name}}"} and {"{{load_number}}"} as placeholders.
        </p>

        <textarea
          value={firstMessage}
          onChange={(e) => setFirstMessage(e.target.value)}
          disabled={viewOnly}
          className={`mt-4 w-full h-24 p-4 rounded-lg border font-mono text-sm text-gray-900 dark:text-slate-100 ${
            viewOnly 
              ? "bg-gray-100 dark:bg-slate-800 cursor-not-allowed" 
              : "bg-gray-50 dark:bg-slate-900"
          } dark:border-slate-700`}
          placeholder="Hi {{driver_name}}, this is Dispatch calling..."
        />
      </section>

      {/* Main Prompt */}
      <section className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700">
        <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          Agent Prompt
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Instructions that guide the agent's conversation behavior.
        </p>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={viewOnly}
          className={`mt-4 w-full h-64 p-4 rounded-lg border font-mono text-sm text-gray-900 dark:text-slate-100 ${
            viewOnly 
              ? "bg-gray-100 dark:bg-slate-800 cursor-not-allowed" 
              : "bg-gray-50 dark:bg-slate-900"
          } dark:border-slate-700`}
          placeholder="Enter the agent's instructions..."
        />
      </section>

      {/* Post-Call Summary */}
      <section className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700">
        <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
          Post-Call Summary Prompt
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Instructions for extracting structured data after the call ends. Copy this to Retell AI's Post-Call Analysis.
        </p>

        <textarea
          value={postCallSummary}
          onChange={(e) => setPostCallSummary(e.target.value)}
          disabled={viewOnly}
          className={`mt-4 w-full h-40 p-4 rounded-lg border font-mono text-sm text-gray-900 dark:text-slate-100 ${
            viewOnly 
              ? "bg-gray-100 dark:bg-slate-800 cursor-not-allowed" 
              : "bg-gray-50 dark:bg-slate-900"
          } dark:border-slate-700`}
          placeholder="Extract the following from the conversation..."
        />
      </section>

      {/* Emergency Handling */}
      <section className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
            Emergency Detection
          </h2>
          <label className={`flex items-center gap-2 ${viewOnly ? "" : "cursor-pointer"}`}>
            <input
              type="checkbox"
              checked={emergencyEnabled}
              onChange={() => !viewOnly && setEmergencyEnabled(!emergencyEnabled)}
              disabled={viewOnly}
              className={`w-5 h-5 ${viewOnly ? "cursor-not-allowed" : ""}`}
            />
            <span className="text-gray-700 dark:text-slate-300">Enabled</span>
          </label>
        </div>

        {emergencyEnabled && (
          <>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
              When these phrases are detected, the agent will switch to emergency protocol.
            </p>

            {!viewOnly && (
              <div className="flex gap-2 mt-4">
                <input
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTrigger()}
                  placeholder="Add trigger phrase..."
                  className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
                />
                <button
                  onClick={addTrigger}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Add
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {emergencyTriggers.map((trigger) => (
                <span
                  key={trigger}
                  className="px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm flex items-center gap-2"
                >
                  {trigger}
                  {!viewOnly && (
                    <button
                      onClick={() => removeTrigger(trigger)}
                      className="hover:text-red-900 dark:hover:text-red-100"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        {viewOnly ? (
          <>
            <button
              onClick={() => navigate(`/agent-configs/${id}`)}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg transition-colors"
            >
              Edit Configuration
            </button>
            <button
              onClick={() => navigate("/agent-configs")}
              className="px-8 py-3 rounded-xl bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium transition-colors"
            >
              Back to List
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium shadow-lg transition-colors"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Configuration"}
            </button>
            <button
              onClick={() => navigate("/agent-configs")}
              className="px-8 py-3 rounded-xl bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-medium transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
