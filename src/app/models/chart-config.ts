export interface ChartConfig {
  type: 'pie' | 'line';
  labels: string[];
  data: number[];
  backgroundColor: string | string[];
  hoverOffset?: number;
}
