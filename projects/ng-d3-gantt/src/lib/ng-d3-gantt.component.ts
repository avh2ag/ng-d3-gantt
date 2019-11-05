import { Component, OnInit, Input, AfterViewInit, HostListener } from '@angular/core';
import { NgD3GanttService } from './ng-d3-gantt.service';
import { IGanttConfig, IGanttData } from './ng-d3-gantt.interface';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ng-d3-gantt',
  template: `
    <div [id]="chartElementId">
      ng-d3-gantt works!
    </div>
  `,
  styles: [],
})
export class NgD3GanttComponent implements OnInit, AfterViewInit {
  @Input() chartElementId = 'ng-d3-gantt-chart';
  @Input() data: Array<IGanttData> = [];
  @Input() config: IGanttConfig;
  constructor(private ganttService: NgD3GanttService) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.drawChart();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.drawChart();
  }

  private drawChart() {
    this.ganttService.ganttChart(this.data, this.config);
  }

}
