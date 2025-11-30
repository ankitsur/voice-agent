// src/api/calls.ts
import { api } from "./client";
import type { Call, ApiResponse } from "../types";

// List all calls
export async function listCalls(): Promise<ApiResponse<Call[]>> {
  const res = await api.get<ApiResponse<Call[]>>("/calls");
  return res.data;
}

// Get single call with full details
export async function getCall(callId: string): Promise<ApiResponse<Call>> {
  const res = await api.get<ApiResponse<Call>>(`/calls/${callId}`);
  return res.data;
}

// Delete a single call
export async function deleteCall(callId: string): Promise<{ success: boolean; deleted_id: string }> {
  const res = await api.delete<{ success: boolean; deleted_id: string }>(`/calls/${callId}`);
  return res.data;
}

// Delete multiple calls
export async function bulkDeleteCalls(ids: string[]): Promise<{ success: boolean; deleted_count: number }> {
  const res = await api.delete<{ success: boolean; deleted_count: number }>("/calls", {
    data: ids,
  });
  return res.data;
}

// Re-export types for convenience
export type { Call };
