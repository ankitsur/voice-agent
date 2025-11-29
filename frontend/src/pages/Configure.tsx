/* eslint-disable */
// @ts-nocheck

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  createAgentConfig,
  updateAgentConfig,
  getAgentConfig,
} from "../api/agentConfig";

export default function Configure() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // =============== AGENT IDENTITY ==================
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");

  // =============== MAIN PROMPT ==================
  const [prompt, setPrompt] = useState(
    `You are an AI dispatch agent responsible for driver check-ins, routing, emergency detection, and structured data extraction.
Start every call with a friendly introduction, collect status updates, and if an emergency is detected, switch modes immediately.`
  );

  // =============== VOICE SETTINGS ==================
  const [voiceModel, setVoiceModel] = useState("retell-voice-en-US-1");
  const [speakingRate, setSpeakingRate] = useState("normal");
  const [tone, setTone] = useState("professional");
  const [fillerWords, setFillerWords] = useState("medium");
  const [backchanneling, setBackchanneling] = useState(true);

  // =============== BEHAVIOR SETTINGS ==================
  const [interruptionSensitivity, setInterruptionSensitivity] = useState(70);
  const [silenceThreshold, setSilenceThreshold] = useState(900);
  const [interruptibility, setInterruptibility] = useState("always");

  // =============== EMERGENCY LOGIC ==================
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [emergencyTriggers, setEmergencyTriggers] = useState([
    "accident",
    "blowout",
    "pulled over",
    "medical",
    "hurt",
  ]);
  const [newTrigger, setNewTrigger] = useState("");

  // =============== EDGE CASES ==================
  const [maxRetries, setMaxRetries] = useState(3);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.55);
  const [conflictStrategy, setConflictStrategy] = useState("ask");

  // =============== EXTRACTION RULES ==================
  const [extractionRules, setExtractionRules] = useState(
    "driver_status, current_location, eta, delay_reason, unloading_status"
  );

  // =======================================================
  //               LOAD CONFIG IN EDIT MODE
  // =======================================================
  useEffect(() => {
    if (!isEdit) return;

    async function load() {
      setLoading(true);
      try {
        const res = await getAgentConfig(id);
        const data = res.data;

        setAgentName(data.name);
        setAgentDescription(data.description);

        const c = data.config;

        setPrompt(c.prompt);
        setVoiceModel(c.voice.model);
        setSpeakingRate(c.voice.speakingRate);
        setTone(c.voice.tone);
        setFillerWords(c.voice.fillerWords);
        setBackchanneling(c.voice.backchanneling);

        setInterruptionSensitivity(c.behavior.interruptionSensitivity);
        setSilenceThreshold(c.behavior.silenceThreshold);
        setInterruptibility(c.behavior.interruptibility);

        setEmergencyEnabled(c.emergency.enabled);
        setEmergencyTriggers(c.emergency.triggers);

        setMaxRetries(c.edgeCases.maxRetries);
        setConfidenceThreshold(c.edgeCases.confidenceThreshold);
        setConflictStrategy(c.edgeCases.conflictStrategy);

        setExtractionRules(c.extraction);

      } catch (error) {
        toast.error("Failed to load config");
      }
      setLoading(false);
    }

    load();
  }, [id, isEdit]);


  // =======================================================
  //                 SAVE CONFIG (POST / PUT)
  // =======================================================
  const handleSave = async () => {
    setSaving(true);

    const payload = {
      name: agentName,
      description: agentDescription,
      config: {
        prompt,
        voice: {
          model: voiceModel,
          speakingRate,
          tone,
          fillerWords,
          backchanneling,
        },
        behavior: {
          interruptionSensitivity,
          silenceThreshold,
          interruptibility,
        },
        emergency: {
          enabled: emergencyEnabled,
          triggers: emergencyTriggers,
        },
        edgeCases: {
          maxRetries,
          confidenceThreshold,
          conflictStrategy,
        },
        extraction: extractionRules,
      },
    };

    try {
      if (isEdit) {
        await updateAgentConfig(id, payload);
        toast.success("Configuration updated successfully!");
      } else {
        await createAgentConfig(payload);
        toast.success("Configuration created successfully!");
      }

      navigate("/agent-configs");
    } catch (err) {
      toast.error("Failed to save configuration.");
    }

    setSaving(false);
  };


  const addTrigger = () => {
    if (!newTrigger.trim()) return;
    setEmergencyTriggers([...emergencyTriggers, newTrigger]);
    setNewTrigger("");
  };

  if (loading) {
    return (
      <div className="mt-20 p-10 text-gray-700 dark:text-gray-200">
        Loading configuration...
      </div>
    );
  }

  // =======================================================
  //                       UI START
  // =======================================================
  return (
    <div className="ml-64 mt-16 p-10 pb-24 w-full">

      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {isEdit ? "Edit Agent Configuration" : "Create New Agent Configuration"}
      </h1>
      <p className="text-gray-600 dark:text-slate-400 mt-2 text-lg">
        Define prompts, voice settings, emergency rules, and structured extraction logic.
      </p>

      {/* ======================================================= */}
      {/*                    AGENT IDENTITY CARD                  */}
      {/* ======================================================= */}
      <section className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl border dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          Agent Identity
        </h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Provide a name and description for the agent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          {/* Agent Name */}
          <div>
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Agent Name
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="mt-2 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
              placeholder="Example: Dispatch Check-In Agent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Description
            </label>
            <textarea
              value={agentDescription}
              onChange={(e) => setAgentDescription(e.target.value)}
              className="mt-2 p-3 w-full h-24 rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
            />
          </div>

        </div>
      </section>

      {/* ======================================================= */}
      {/*                    MAIN PROMPT CARD                    */}
      {/* ======================================================= */}
      <section className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          Main Conversation Prompt
        </h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-4 w-full h-40 p-4 rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
        />
      </section>

      {/* ======================================================= */}
      {/*                    VOICE SETTINGS                      */}
      {/* ======================================================= */}
      <section className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl border shadow-lg dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          Voice & Delivery Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

          {/* Voice Model */}
          <div>
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Voice Model
            </label>
            <select
              className="mt-2 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
              value={voiceModel}
              onChange={(e) => setVoiceModel(e.target.value)}
            >
              <option value="retell-voice-en-US-1">English - US (Voice 1)</option>
              <option value="retell-voice-en-US-2">English - US (Voice 2)</option>
              <option value="retell-voice-en-US-3">English - US (Voice Voice 3)</option>
            </select>
          </div>

          {/* Speaking Rate */}
          <div>
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Speaking Rate
            </label>
            <select
              value={speakingRate}
              onChange={(e) => setSpeakingRate(e.target.value)}
              className="mt-2 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Tone / Emotion
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-2 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="empathetic">Empathetic</option>
              <option value="confident">Confident</option>
            </select>
          </div>

          {/* Filler Words */}
          <div>
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Filler Words
            </label>
            <select
              value={fillerWords}
              onChange={(e) => setFillerWords(e.target.value)}
              className="mt-2 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Backchanneling */}
          <div className="col-span-2 flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              checked={backchanneling}
              onChange={() => setBackchanneling(!backchanneling)}
              className="w-5 h-5"
            />
            <label className="font-semibold text-gray-800 dark:text-slate-100">
              Enable Backchanneling
            </label>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/*                    BEHAVIOR SETTINGS                    */}
      {/* ======================================================= */}
      <section className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl border shadow-lg dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          Behavior Settings
        </h2>

        {/* Interruption Sensitivity */}
        <div className="mt-6">
          <label className="font-semibold text-gray-800 dark:text-slate-100">
            Interruption Sensitivity ({interruptionSensitivity}%)
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={interruptionSensitivity}
            onChange={(e) => setInterruptionSensitivity(Number(e.target.value))}
            className="mt-3 w-full"
          />
        </div>

        {/* Silence Threshold */}
        <div className="mt-6">
          <label className="font-semibold text-gray-800 dark:text-slate-100">
            Silence Detection Threshold (ms)
          </label>
          <input
            type="number"
            value={silenceThreshold}
            onChange={(e) => setSilenceThreshold(Number(e.target.value))}
            className="mt-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100 w-full"
          />
        </div>

        {/* Interruptibility */}
        <div className="mt-6">
          <label className="font-semibold text-gray-800 dark:text-slate-100">
            Interruptibility
          </label>
          <select
            value={interruptibility}
            onChange={(e) => setInterruptibility(e.target.value)}
            className="mt-2 p-3 w-full rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
          >
            <option value="always">Always Interruptible</option>
            <option value="partial">Partially Interruptible</option>
            <option value="never">Never Interruptible</option>
          </select>
        </div>
      </section>

      {/* ======================================================= */}
      {/*                    EMERGENCY HANDLING                   */}
      {/* ======================================================= */}
      <section className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl border shadow-lg dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          Emergency Handling Logic
        </h2>

        {/* Toggle Emergency Mode */}
        <div className="flex items-center gap-3 mt-4">
          <input
            type="checkbox"
            checked={emergencyEnabled}
            onChange={() => setEmergencyEnabled(!emergencyEnabled)}
            className="w-5 h-5"
          />
          <label className="font-semibold text-gray-800 dark:text-slate-100">
            Enable Emergency Mode
          </label>
        </div>

        {/* Triggers */}
        <div className="mt-6">
          <label className="font-semibold text-gray-800 dark:text-slate-100">
            Emergency Trigger Phrases
          </label>

          <div className="flex gap-3 mt-3">
            <input
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              placeholder="Add new trigger phrase..."
              className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
            />
            <button
              onClick={addTrigger}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {emergencyTriggers.map((t, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-full bg-slate-700 text-slate-200 text-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/*                    EDGE CASE LOGIC                     */}
      {/* ======================================================= */}
      <section className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl border shadow-lg dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          Driver Edge Case Handling
        </h2>

        {/* Max Retries */}
        <div className="mt-6">
          <label className="font-semibold text-gray-800 dark:text-slate-100">
            Max Retry Attempts
          </label>
          <input
            type="number"
            value={maxRetries}
            onChange={(e) => setMaxRetries(Number(e.target.value))}
            className="mt-2 p-3 rounded-lg w-full bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Confidence Threshold */}
        <div className="mt-6">
          <label className="font-semibold text-gray-800 dark:text-slate-100">
            Noisy Environment Confidence Threshold
          </label>
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={confidenceThreshold}
            onChange={(e) =>
              setConfidenceThreshold(Number(e.target.value))
            }
            className="mt-2 p-3 rounded-lg w-full bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
          />
        </div>

        {/* Conflict Strategy */}
        <div className="mt-6">
          <label className="font-semibold text-gray-800 dark:text-slate-100">
            GPS Conflict Strategy
          </label>
          <select
            value={conflictStrategy}
            onChange={(e) => setConflictStrategy(e.target.value)}
            className="mt-2 p-3 rounded-lg w-full bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
          >
            <option value="soft">Soft Correction</option>
            <option value="ask">Ask For Clarification</option>
            <option value="escalate">Escalate Immediately</option>
          </select>
        </div>
      </section>

      {/* ======================================================= */}
      {/*                    EXTRACTION RULES                    */}
      {/* ======================================================= */}
      <section className="mt-10 p-6 bg-white dark:bg-slate-800 rounded-xl border shadow-lg dark:border-slate-700">
        <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-400">
          Structured Data Extraction Rules
        </h2>

        <textarea
          value={extractionRules}
          onChange={(e) => setExtractionRules(e.target.value)}
          className="mt-4 p-4 rounded-lg w-full h-32 bg-gray-50 dark:bg-slate-900 border dark:border-slate-700 text-gray-900 dark:text-slate-100"
        />
      </section>

      {/* ======================================================= */}
      {/*                     SAVE BUTTON                        */}
      {/* ======================================================= */}
      <div className="mt-12">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-12 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-lg shadow-xl"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Configuration"}
        </button>
      </div>

    </div>
  );
}
