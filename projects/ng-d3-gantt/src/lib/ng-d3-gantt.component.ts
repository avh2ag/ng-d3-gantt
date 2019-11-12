import { Component, OnInit, Input, AfterViewInit, HostListener, ViewEncapsulation,
  OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { NgD3GanttService } from './ng-d3-gantt.service';
import { IGanttConfig, IGanttData } from './ng-d3-gantt.interface';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ng-d3-gantt',
  template: `
    <button [class]="buttonClasses" (click)="goToPrevious()">Previous</button>
    <button [class]="buttonClasses" (click)="goToNext()">Next</button>
    <div [id]="chartElementId" class="gantt-chart">
    </div>
  `,
  styleUrls: ['./ng-d3-gantt.scss'],
  providers: [NgD3GanttService],
  encapsulation: ViewEncapsulation.None
})
// will likely need on changes
export class NgD3GanttComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() chartElementId = 'ng-d3-gantt-chart';
  @Input() data: Array<IGanttData> = [];
  @Input() config: IGanttConfig;
  @Input() buttonClasses = '';
  private isInitialChartDrawn = false;
  constructor(private ganttService: NgD3GanttService) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    const config: SimpleChange = changes.config;
    const data: SimpleChange = changes.data;
    const isConfigChanged = this.getIsPropertyChanged(config);
    const isDataChanged = this.getIsPropertyChanged(data);
    if (this.isInitialChartDrawn) {
      if (isConfigChanged || isDataChanged) {
        this.drawInitialChart();
      }
    }
  }

  ngAfterViewInit() {
    this.drawInitialChart();
    this.isInitialChartDrawn = true;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.drawInitialChart();
  }

  private getIsPropertyChanged(change: SimpleChange) {
    if (change) {
      return JSON.stringify(change.previousValue) !== JSON.stringify(change.currentValue);
    }
    return false;
  }

  public goToPrevious() {
   this.config = this.ganttService.goToPrevious(this.config);
   this.ganttService.clearChart(this.chartElementId);
   this.ganttService.draw('previous', this.data, this.config, this.chartElementId);
  }

  public goToNext() { // note: we're gonna have to send emitters to parent as we get more in here
    this.config = this.ganttService.goToNext(this.config);
    this.ganttService.clearChart(this.chartElementId);
    this.ganttService.draw('next', this.data, this.config, this.chartElementId);
  }

  private drawInitialChart() {
    this.ganttService.clearChart(this.chartElementId);
    this.ganttService.draw('initial', this.data, this.config, this.chartElementId);
  }

}
