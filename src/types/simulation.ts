export interface SimulationJobRecord {
  id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  dataset_id: number;
  settings: Record<string, any>;
  result_path?: string;
  log_path?: string;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface SimulationJobCreateRequest {
  dataset_id: number;
  settings?: Record<string, any>;
}

export interface SimulationJobCreateResponse {
  id: number;
  status: string;
}

export interface SimulationJobRunningResponse {
  running: boolean;
  job?: SimulationJobRecord;
}

export type SimulationSettings = Record<string, string | number | boolean>; 