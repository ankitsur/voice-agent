// src/pages/AgentConfigList.tsx
import { useEffect, useState, useCallback } from "react";
import Table from "../components/Table";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";
import { listAgentConfigs, bulkDeleteAgentConfigs } from "../api/agentConfig";
import { useNavigate } from "react-router-dom";
import type { AgentConfig } from "../types";

export default function AgentConfigList() {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    } catch {
      toast.error("Failed to load configurations");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteClick = () => {
    if (selected.length === 0) return;
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await bulkDeleteAgentConfigs(selected);
      toast.success(`Deleted ${selected.length} configuration(s)`);
      setSelected([]);
      setShowDeleteModal(false);
      load();
    } catch {
      toast.error("Failed to delete configurations");
    }
    setDeleting(false);
  };

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="p-10 mt-16 ml-64">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Configuration"
        message={
          selected.length === 1
            ? "Are you sure you want to delete this agent configuration? This action cannot be undone."
            : `Are you sure you want to delete ${selected.length} agent configurations? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

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
        <div className="flex items-center gap-4 mt-6 p-4 bg-gray-100 dark:bg-slate-700 rounded-lg">
          <span className="text-gray-700 dark:text-gray-100 font-medium">
            {selected.length} selected
          </span>

          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Delete
          </button>

          {selected.length === 1 && (
            <button
              onClick={() => navigate(`/agent-configs/${selected[0]}`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Edit
            </button>
          )}

          <button
            onClick={() => setSelected([])}
            className="px-4 py-2 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Clear Selection
          </button>
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
