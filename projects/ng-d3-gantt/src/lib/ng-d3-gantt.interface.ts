export interface IGanttConfig {
  element: string;
  box_padding: number; // move to extras
  metrics: IGanttMetrics;
  isShowProgressBar: boolean;
  isShowGridlines: boolean;
  onClick: (data: any) => void;
  onEmptyButtonClick: () => void;
  onAreaClick: (location: any) => void;
}
// things that we'll have default values for, but allow overrides
export interface IGanttExtras {
  margin: { top: number, right: number, bottom: number, left: number };
  emptyButtonColor: string;
  box_padding: number;
  progressbarWidth: number;
  progressBarBoundary: number;
  buttonColor: string;
  emptyData: IGanttEmptyDataConfig;
  selectedColor: string; // #4894ff
  defaultGridColor: string; // #d9d9d9
}

export interface IGanttEmptyDataConfig {
  text: string;
  blockHeight: number;
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
  extras?: any;
}
