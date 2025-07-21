export interface Dataset {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  fp_id: string;
  lat: number;
  log: number;
  orders_count?: number;
}

export interface DatasetImportRequest {
  csv_url: string;
  dataset_name?: string;
}

export interface DatasetImportResponse {
  message: string;
  job_id: string;
  status: string;
} 