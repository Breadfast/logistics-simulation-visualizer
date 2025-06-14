
export interface Run {
  id: number;
  created_at: string;
  updated_at: string;
  json: {
    settings: [string, string | number | boolean][];
  };
  fp_id: string;
  run_id: number;
  name: string | null;
  prep_hot_food_sla_in_min: number;
  prep_coffee_sla_in_min: number;
  prep_grocery_sla_in_min: number;
  delivery_hot_food_sla_in_min: number;
  delivery_coffee_sla_in_min: number;
  customer_sla_in_min: number;
  late_time_sla_in_min: number;
  average_speed: number;
  failed_orders_count: number;
}
