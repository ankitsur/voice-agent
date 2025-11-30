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

// Re-export types for convenience
export type { Call };
