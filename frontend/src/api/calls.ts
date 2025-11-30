// src/api/calls.ts
import { api } from "./client";

export interface CallData {
  id: string;
  agent_config_id: string | null;
  driver_name: string;
  driver_phone: string;
  load_number: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  retell_call_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  transcript?: string;
  transcript_object?: Array<{ role: string; content: string }>;
  structured_data?: Record<string, unknown>;
}

// List all calls
export async function listCalls(): Promise<{ data: CallData[] }> {
  const res = await api.get("/calls");
  return res.data;
}

// Get single call with full details
export async function getCall(callId: string): Promise<{ data: CallData }> {
  const res = await api.get(`/calls/${callId}`);
  return res.data;
}

