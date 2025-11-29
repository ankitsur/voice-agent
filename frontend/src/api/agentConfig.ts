/* eslint-disable */
import { api } from "./client";

export interface AgentConfigPayload {
  name: string;
  description: string;
  config: any; // you can replace this with typed version later
}

// CREATE
export async function createAgentConfig(payload: AgentConfigPayload) {
  const res = await api.post("/agent-configs", payload);
  return res.data;
}

// LIST ALL
export async function listAgentConfigs() {
  const res = await api.get("/agent-configs");
  return res.data;
}

// GET ONE
export async function getAgentConfig(id: string) {
  const res = await api.get(`/agent-configs/${id}`);
  return res.data;
}

// UPDATE
export async function updateAgentConfig(id: string, payload: AgentConfigPayload) {
  const res = await api.put(`/agent-configs/${id}`, payload);
  return res.data;
}

// DELETE ONE
export async function deleteAgentConfig(id: string) {
  const res = await api.delete(`/agent-configs/${id}`);
  return res.data;
}

// BULK DELETE
export async function bulkDeleteAgentConfigs(ids: string[]) {
  const res = await api.delete(`/agent-configs`, {
    data: ids,
  });
  return res.data;
}
