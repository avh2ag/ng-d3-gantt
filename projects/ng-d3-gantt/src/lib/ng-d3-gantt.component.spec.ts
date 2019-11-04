import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgD3GanttComponent } from './ng-d3-gantt.component';

describe('NgD3GanttComponent', () => {
  let component: NgD3GanttComponent;
  let fixture: ComponentFixture<NgD3GanttComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgD3GanttComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgD3GanttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
