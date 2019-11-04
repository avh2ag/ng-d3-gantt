export interface IGanttConfig {
  box_padding: number;
  metrics: object; // make an interface
  onClick: (data: any) => void;
  onEmptyButtonClick: () => void;
  onAreaClick: (location: any) => void;
}
