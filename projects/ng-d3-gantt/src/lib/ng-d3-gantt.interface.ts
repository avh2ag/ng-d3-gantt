export interface IGanttConfig {
  element: string;
  box_padding: number;
  metrics: IGanttMetrics; // make an interface
  onClick: (data: any) => void;
  onEmptyButtonClick: () => void;
  onAreaClick: (location: any) => void;
}

export interface IGanttMetrics {
  type: 'overall' | 'quarterly' | 'sprint' | 'monthly' | 'yearly';
  year?: number;
  years?: Array<number>;
  month?: string;
  months?: Array<string>;
  cycles?: Array<IGanttCycle>;
}

export interface IGanttCycle {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}
