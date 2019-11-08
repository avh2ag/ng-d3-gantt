import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgD3GanttModule } from 'ng-d3-gantt';

import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgD3GanttModule,
    NoopAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
