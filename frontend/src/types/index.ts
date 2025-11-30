// src/types/index.ts

// Agent Configuration Types
export interface VoiceSettings {
  model: string;
  speakingRate: string;
  tone: string;
  fillerWords: string;
  backchanneling: boolean;
}

export interface BehaviorSettings {
  interruptionSensitivity: number;
  silenceThreshold: number;
  interruptibility: string;
}

export interface EmergencySettings {
  enabled: boolean;
  triggers: string[];
}

export interface EdgeCaseSettings {
  maxRetries: number;
  confidenceThreshold: number;
  conflictStrategy: string;
}

export interface AgentConfigDetails {
  prompt: string;
  voice: VoiceSettings;
  behavior: BehaviorSettings;
  emergency: EmergencySettings;
  edgeCases: EdgeCaseSettings;
  extraction: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  description?: string | null;
  config: AgentConfigDetails | Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Call Types
export type CallStatus = "queued" | "in_progress" | "completed" | "failed";

export interface StructuredData {
  call_type?: string;
  call_outcome?: string;
  driver_status?: string;
  current_location?: string | null;
  eta?: string | null;
  delay_reason?: string | null;
  unloading_status?: string | null;
  pod_reminder_acknowledged?: boolean;
  emergency_type?: string;
  safety_status?: string | null;
  injury_status?: string | null;
  emergency_location?: string | null;
  load_secure?: boolean;
  escalation_status?: string;
}

export interface TranscriptSegment {
  role: "agent" | "user";
  content: string;
  timestamp?: number;
}

export interface Call {
  id: string;
  agent_config_id?: string | null;
  driver_name: string;
  driver_phone: string;
  load_number: string;
  status: CallStatus;
  retell_call_id?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  created_at?: string;
  transcript?: string;
  transcript_object?: TranscriptSegment[];
  structured_data?: StructuredData;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
