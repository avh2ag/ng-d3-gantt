import { Component, OnInit, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ng-d3-gantt',
  template: `
    <div [id]="chartElementId">
      ng-d3-gantt works!
    </div>
  `,
  styles: []
})
export class NgD3GanttComponent implements OnInit {
  @Input() chartElementId = 'ng-gantt-chart';
  constructor() { }

  ngOnInit() {
  }

}
