export interface IGanttConfig {
  box_padding: number;
  metrics: IGanttMetrics;
  isShowProgressBar: boolean;
  isShowGridlines: boolean;
  dateFormat: string;
  emptyText?: string;
  onClick: (data: any) => void;
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
  id?: number;
  name: string;
  start_date: string | Date;
  end_date: string | Date;
}

export interface IGanttData {
  id: number;
  title: string;
  subtitle: string;
  start_date: string;
  end_date: string;
  color: string;
  completion_percentage?: number;
}
