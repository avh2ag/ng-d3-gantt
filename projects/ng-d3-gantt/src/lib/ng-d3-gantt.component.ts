import { Component, OnInit, Input, AfterViewInit, HostListener, ViewEncapsulation } from '@angular/core';
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
export class NgD3GanttComponent implements OnInit, AfterViewInit {
  @Input() chartElementId = 'ng-d3-gantt-chart';
  @Input() data: Array<IGanttData> = [];
  @Input() config: IGanttConfig;
  @Input() buttonClasses = '';
  constructor(private ganttService: NgD3GanttService) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.drawInitialChart();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.drawInitialChart();
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
