import { Component, ChangeDetectorRef } from '@angular/core';
import { IGanttData, IGanttConfig } from 'ng-d3-gantt';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private cd: ChangeDetectorRef) {}
  title = 'd3-gantt';
  public buttonClasses = 'mat-raised-button mat-button-base mat-primary';
  public data: Array<IGanttData> = [
    {
      id: 1,
      title: 'Step 1 title that runneth over and over and over and over and over',
      start_date: '08/08/2016',
      end_date: '03/09/2017',
      subtitle: 'Short subtitle',
      // completion_percentage: 29,
      color: '#770051',
    },
    {
      id: 2,
      title: 'Step 2',
      start_date: '11/01/2017',
      end_date: '03/09/2018',
      subtitle: 'Short subtitle',
      completion_percentage: 29,
      color: '#05f20c',
    },
    {
      id: 3,
      title: 'Step 3',
      start_date: '04/15/2017',
      end_date: '06/14/2017',
      subtitle: 'Short subtitle',
      completion_percentage: 29,
      color: '#914ae1',
    },
    {
      id: 4,
      title: 'Step 4',
      start_date: '06/11/2017',
      end_date: '08/30/2017',
      subtitle: 'Short subtitle but with a lemon twist',
      completion_percentage: 29,
      color: '#b79d3b',
    },
    {
      id: 5,
      title: 'Step 5',
      start_date: '07/31/2017',
      end_date: '12/09/2017',
      subtitle: 'Short subtitle',
      completion_percentage: 29,
      color: '#423db6',
    }
  ];
  public dataAsync = of(this.data);
  public isDefaultConfig = true;

  public cycles = [
    {
      id: 1,
      name: 'Cycle 1',
      start_date: '01/01/2017',
      end_date: '02/28/2017',
    },
    {
      id: 2,
      name: 'Cycle 2',
      start_date: '05/01/2017',
      end_date: '06/30/2017',
    },
    {
      id: 3,
      name: 'Cycle 3',
      start_date: '07/01/2017',
      end_date: '10/30/2017',
    },
    {
      id: 3,
      name: 'Cycle 4',
      start_date: '10/01/2017',
      end_date: '12/30/2017',
    }
  ];
  public chartContainerName = 'test-container';
  public config: IGanttConfig = {
    dateFormat: 'MM/DD/YYYY',
    box_padding: 8, // Padding for the blocks in d3 units not pixels
    // metrics: {type: 'overall', years: [2016, 2017, 2018]}, // Type of gantt
    // metrics: {type: 'sprint', year: 2017, cycles: this.cycles}, // Type of gantt
    metrics: {type: 'yearly', year: 2017}, // Type of gantt
    // metrics: {type: 'monthly', month: 'March 2017'}, // For Monthly Data
    // metrics: {type: 'quarterly', months: ['January 2017', 'February 2017', 'March 2017']}, // For quarterly or half yearly data
    isShowProgressBar: true,
    isShowGridlines: true,
    onClick: (data) => {
      console.log('onClick called on ', data );
    }
  };

  public switchConfig() {
    const testConfig = {...this.config};
    if (this.isDefaultConfig) {
      testConfig.metrics = {type: 'monthly', month: 'March 2017'};
    } else {
      testConfig.metrics = {type: 'yearly', year: 2019};
    }
    this.config = {...testConfig };
    // this.cd.markForCheck();
    this.isDefaultConfig = !this.isDefaultConfig;
  }
}
