
// API Configuration
// Change this URL to point to your backend API
export const API_BASE_URL = 'http://localhost:3000/';

// Mapbox Configuration
// Add your Mapbox public token here
export const MAPBOX_TOKEN = 'pk.eyJ1IjoicGVycnl3YWxpZCIsImEiOiJjbWJ3bXY1NWQwc3d3MmxzOHYxcGxlNXpmIn0.0N-UAro3mBUa_pxiHCb42A';

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

import {
  SimulationJobRecord,
  SimulationJobCreateRequest,
  SimulationJobCreateResponse,
  SimulationJobRunningResponse,
  SimulationSettings,
} from "@/types/simulation";
import { Dataset } from "@/types/dataset";

export async function fetchSimulationSettings(): Promise<SimulationSettings> {
  const res = await fetch(buildApiUrl("/settings"));
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function fetchDatasets(): Promise<Dataset[]> {
  const res = await fetch(buildApiUrl("/datasets"));
  if (!res.ok) throw new Error("Failed to fetch datasets");
  return res.json();
}

export async function fetchSimulationJobs(): Promise<SimulationJobRecord[]> {
  const res = await fetch(buildApiUrl("/simulation_job_records"));
  if (!res.ok) throw new Error("Failed to fetch simulation jobs");
  return res.json();
}

export async function fetchSimulationJob(id: number): Promise<SimulationJobRecord> {
  const res = await fetch(buildApiUrl(`/simulation_job_records/${id}`));
  if (!res.ok) throw new Error("Failed to fetch simulation job");
  return res.json();
}

export async function createSimulationJob(
  data: SimulationJobCreateRequest
): Promise<SimulationJobCreateResponse> {
  const res = await fetch(buildApiUrl("/simulation_job_records"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create simulation job");
  }
  return res.json();
}

export async function checkSimulationJobRunning(): Promise<SimulationJobRunningResponse> {
  const res = await fetch(buildApiUrl("/simulation_job_records/running"));
  if (!res.ok) throw new Error("Failed to check running simulation job");
  return res.json();
}
