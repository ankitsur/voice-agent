// src/api/testCall.ts
import { api } from "./client";

export interface StartCallPayload {
  agent_config_id: string;
  driver_name: string;
  driver_phone: string;
  load_number: string;
}

export interface StartCallResponse {
  success: boolean;
  call_id: string;
  retell_call_id: string;
  access_token: string;
  access_token_expires_in?: number;
}

export async function startCall(payload: StartCallPayload): Promise<StartCallResponse> {
  const res = await api.post<StartCallResponse>("/start-call", payload);
  return res.data;
}
