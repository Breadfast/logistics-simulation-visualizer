
export interface Task {
  id: string;
  lat: number;
  lon: number;
  service: string[];
  task_type: 'pickup' | 'delivery';
  start_time: string;
  end_time: string;
  late_time: number;
  ready_at?: string;
}

export interface Order {
  id: number;
  tasks: Task[];
  customer: { lat: number; lon: number };
  start_time: string;
  end_time: string;
  has_grocery: boolean;
  has_coffee: boolean;
  has_hot_food: boolean;
  late_time?: number;
  received_at?: string;
  segment_sla?: string;
  deadline_date?: string;
  duration_from_previous?: number;
  pickup_to_delivery_time?: number;
}

export interface Trip {
  id: number;
  run_id: number;
  json: {
    orders: Order[];
    distance: number;
    duration: number;
    driver_id: number;
    start_time: string;
    end_time: string;
    order_of_events: string[];
  };
  created_at: string;
  updated_at: string;
  latency: number;
  dead_head_time: number;
  assignment_time: string;
  tick: number;
}
