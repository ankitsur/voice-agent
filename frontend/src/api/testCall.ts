import { api } from "./client";

export async function startCall(payload: {
  agent_config_id: string;
  driver_name: string;
  driver_phone: string;
  load_number: string;
}) {
  const res = await api.post("/start-call", payload);
  return res.data;
}

