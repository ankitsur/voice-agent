export type AgentConfig = {
  id: string;
  name: string;
  description?: string | null;
  config: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type Call = {
  id: string;
  agent_config_id?: string | null;
  driver_name: string;
  driver_phone: string;
  load_number: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  started_at?: string | null;
  ended_at?: string | null;
};

export type TranscriptRow = {
  id: string;
  call_id: string;
  segment_order: number;
  speaker: string;
  text: string;
  timestamp?: string;
};

export type SummaryRow = {
  id: string;
  call_id: string;
  summary: Record<string, unknown>;
  created_at?: string;
};
