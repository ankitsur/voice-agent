// src/pages/AgentConfigList.tsx
import { useEffect, useState, useCallback } from "react";
import Table from "../components/Table";
import toast from "react-hot-toast";
import { listAgentConfigs, bulkDeleteAgentConfigs } from "../api/agentConfig";
import { useNavigate } from "react-router-dom";
import type { AgentConfig } from "../types";

export default function AgentConfigList() {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const toggle = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAgentConfigs();
      setConfigs(res.data || []);
    } catch (error) {
      toast.error("Failed to load configurations");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSelected = useCallback(async () => {
    try {
      await bulkDeleteAgentConfigs(selected);
      toast.success("Deleted successfully!");
      setSelected([]);
      load();
    } catch (error) {
      toast.error("Failed to delete configurations");
    }
  }, [selected, load]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-10 mt-16 ml-64">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl text-gray-900 dark:text-white font-bold">
          Agent Configurations
        </h1>

        <button
          onClick={() => navigate("/agent-configs/new")}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          + Create New Configuration
        </button>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-4 mt-6 p-4 bg-gray-200 dark:bg-slate-700 rounded-lg">
          <span className="text-gray-900 dark:text-gray-100">
            {selected.length} selected
          </span>

          <button
            onClick={deleteSelected}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Delete
          </button>

          {selected.length === 1 && (
            <>
              <button
                onClick={() => navigate(`/agent-configs/${selected[0]}`)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                Edit
              </button>

              <button
                onClick={() => navigate(`/agent-configs/${selected[0]}`)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                View
              </button>
            </>
          )}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <p className="text-gray-600 dark:text-slate-400">Loading...</p>
        ) : (
          <Table data={configs} selected={selected} toggle={toggle} />
        )}
      </div>
    </div>
  );
}
