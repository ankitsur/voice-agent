// src/api/agentConfig.ts
import { api } from "./client";
import type { AgentConfig } from "../types";

export interface AgentConfigPayload {
  name: string;
  description?: string | null;
  config: Record<string, unknown>;
}

interface ApiResponse<T> {
  data: T;
}

// CREATE
export async function createAgentConfig(payload: AgentConfigPayload): Promise<ApiResponse<AgentConfig>> {
  const res = await api.post<ApiResponse<AgentConfig>>("/agent-configs", payload);
  return res.data;
}

// LIST ALL
export async function listAgentConfigs(): Promise<ApiResponse<AgentConfig[]>> {
  const res = await api.get<ApiResponse<AgentConfig[]>>("/agent-configs");
  return res.data;
}

// GET ONE
export async function getAgentConfig(id: string): Promise<ApiResponse<AgentConfig>> {
  const res = await api.get<ApiResponse<AgentConfig>>(`/agent-configs/${id}`);
  return res.data;
}

// UPDATE
export async function updateAgentConfig(id: string, payload: AgentConfigPayload): Promise<ApiResponse<AgentConfig>> {
  const res = await api.put<ApiResponse<AgentConfig>>(`/agent-configs/${id}`, payload);
  return res.data;
}

// DELETE ONE
export async function deleteAgentConfig(id: string): Promise<{ success: boolean; deleted_id: string }> {
  const res = await api.delete<{ success: boolean; deleted_id: string }>(`/agent-configs/${id}`);
  return res.data;
}

// BULK DELETE
export async function bulkDeleteAgentConfigs(ids: string[]): Promise<{ success: boolean; deleted_count: number }> {
  const res = await api.delete<{ success: boolean; deleted_count: number }>("/agent-configs", {
    data: ids,
  });
  return res.data;
}
