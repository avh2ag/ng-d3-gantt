
# D3Gantt

  

  

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.10.

  

  

## Development server

  

  

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`.

  

  

To have angular continuously build the project library as you develop, run `ng build ng-d3-gantt-chart --watch`

  

  

## Build

  

Run `ng build ng-d3-gantt` to build the project component library. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

  

To publish to npm, after building, run `npm publish` from the dist folder.

  

## Configuring Ng D3 Gantt Chart

  

### Configuration Options:

  

1. IGanttConfig

```

export interface IGanttConfig {

  

box_padding: number; // padding in d3 units in the box

  

metrics: IGanttMetrics; // describes the scale of the graph

  

isShowProgressBar: boolean; // whether to allow progress bars within each box

  

isShowGridlines: boolean; // toggle gridlines on and off

  

emptyText?: string; // text to display when the grid is empty

  

onClick: (data: any) => void; // hook for when a box is clicked

  

}

  

```

2. IGanttMetrics

```

export interface IGanttMetrics {

  

type: 'overall' | 'quarterly' | 'sprint' | 'monthly' | 'yearly';

  

year?: number;

  

years?: Array<number>;

  

month?: string;

  

months?: Array<string>;

  

cycles?: Array<IGanttCycle>;

  

}

  

```

  

3. Custom Units of Time

```

export interface IGanttCycle {

  

id?: number;

  

name: string;

  

start_date: string | Date;

  

end_date: string | Date;

  

}

```

4. Structure of Data

```

export interface IGanttData {

  

id: number;

  

title: string;

  

subtitle: string;

  

start_date: string; // date or string

  

end_date: string; // date or string

  

completion_percentage?: number; // value to use in the progress bar

  

}

  

```

5. Usage

```
<ng-d3-gantt  chartElementId="gantt-chart"  [config]="config"  [data]="dataAsync | async"  >
</ng-d3-gantt>
```
