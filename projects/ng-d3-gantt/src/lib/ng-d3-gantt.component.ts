import { Component, OnInit, Input, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { NgD3GanttService } from './ng-d3-gantt.service';
import { IGanttConfig } from './ng-d3-gantt.interface';

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
  @Input() chartElementId = 'ng-gantt-chart';
  @Input() data = [];
  @Input() config: IGanttConfig;
  constructor(private ganttService: NgD3GanttService) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.ganttService.ganttChart(this.data, this.config);
  }

}
