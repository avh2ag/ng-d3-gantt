import { TestBed } from '@angular/core/testing';

import { NgD3GanttService } from './ng-d3-gantt.service';

describe('NgD3GanttService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgD3GanttService = TestBed.get(NgD3GanttService);
    expect(service).toBeTruthy();
  });
});
