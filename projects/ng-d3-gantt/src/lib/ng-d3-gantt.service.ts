import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { IGanttConfig, IGanttData, IGanttCycle } from './ng-d3-gantt.interface';
import * as moment_ from 'moment';
import { stringify } from '@angular/compiler/src/util';
import { config } from 'rxjs';
const moment = moment_;

// tslint:disable: no-shadowed-variable
@Injectable({
  providedIn: 'root'
})
export class NgD3GanttService {
  private PROGRESSBAR_WIDTH: number;
  private PROGRESSBAR_BOUNDARY: number;
  private EMPTYBLOCK_HEIGHT: number;
  private BUTTON_COLOR: string;
  private margin: { top: number, right: number, bottom: number, left: number };

  private currentDay: { start_date: Date, end_date: Date };

  constructor() {
    this.PROGRESSBAR_WIDTH = 200;
    this.PROGRESSBAR_BOUNDARY = 250;
    this.EMPTYBLOCK_HEIGHT = 150;
    this.BUTTON_COLOR = '#15bfd8';
    this.currentDay = {
      start_date: moment().startOf('day').toDate(),
      end_date: moment().endOf('day').toDate()
    };
    this.margin = { top: 20, right: 0, bottom: 100, left: 0 };
  }

  public clearChart(containerId: string) {
    d3.select(`#${containerId}`).selectAll('*')
    .remove();
  }

  public goToNext(configData: IGanttConfig) {
    const config = { ...configData };
    switch (config.metrics.type) {
        case 'yearly':
            config.metrics.year = config.metrics.year + 1;
            break;
        case 'overall':
            for (let i = 0; i < config.metrics.years.length; i++) {
                config.metrics.years[i] = config.metrics.years[i] + config.metrics.years.length;
            }
            break;
        case 'sprint':
            break;
        case 'monthly':
            config.metrics.month = moment(config.metrics.month, 'MMMM YYYY').add(1, 'months').format('MMMM YYYY');
            break;
        case 'quarterly':
            const monthsCount = config.metrics.months.length;
            for (let i = 0; i < monthsCount; i++) {
                config.metrics.months[i] = moment(config.metrics.months[i], 'MMMM YYYY')
                  .add(monthsCount, 'months')
                  .format('MMMM YYYY');
            }
            break;
    }
    return config;
  }

  public goToPrevious(configData: IGanttConfig) {
    const config = { ...configData };
    switch (config.metrics.type) {
        case 'yearly':
            config.metrics.year = config.metrics.year - 1;
            break;
        case 'overall':
            for (let i = 0; i < config.metrics.years.length; i++) {
              config.metrics.years[i] = config.metrics.years[i] - config.metrics.years.length;
            }
            break;
        case 'sprint':
            break;
        case 'monthly':
            config.metrics.month = moment(config.metrics.month, 'MMMM YYYY')
              .subtract(1, 'months')
              .format('MMMM YYYY');
            break;
        case 'quarterly':
            const monthsCount = config.metrics.months.length;
            for (let i = 0; i < monthsCount; i++) {
              config.metrics.months[i] = moment(config.metrics.months[i], 'MMMM')
                .subtract(monthsCount, 'months')
                .format('MMMM YYYY');
            }
            break;
    }
    return config;
  }

  private getXScale(width: number, dateBoundary: { start_date: string | Date, end_date: string | Date }) {
    return d3.scaleTime()
      .domain([dateBoundary.start_date, dateBoundary.end_date])
      .range([0, width]);
  }

  private getYScale(height: number, data: Array<IGanttData>) {
    return d3.scaleBand()
      .rangeRound([0, height])
      .padding(0.1)
      .domain(data.map( (d, i) => {
        return i + 1;
      }));
  }

  private drawChartTitle(rootEl, headerRanges, x, y, width: number, dateBoundary) {
    const chartTitle = rootEl
      .append('div')
      .attr('class', 'graph chart-title')
      .style('height', 40)
      .append('svg')
      .attr('width', width + this.margin.left + this.margin.right)
      .attr('height', 40)
      .append('g');
    chartTitle.selectAll('.bar')
      .data(headerRanges)
      .enter().append('text')
      .attr('class', 'first-title')
      .attr('y', -5)
      .attr('x', (d: IGanttData) => {
        return x(new Date(d.start_date)) + (this.getWidth(d, dateBoundary, x) / 2);
      })
      .attr('width', (d: IGanttData) => {
        return this.getWidth(d, dateBoundary, x);
      })
      .attr('height', y.bandwidth())
      .text( d => {
        return d.name;
      });
    return chartTitle;
  }

  private drawTimeSeriesContainer(rootEl, width: number) {
    return rootEl
      .append('div')
      .attr('class', 'graph time-series')
      .style('height', 40)
      .append('svg')
      .attr('width', width + this.margin.left + this.margin.right)
      .attr('height', 40)
      .append('g');
  }

  private drawTransitions(state: string, chartTitle, timeSeriesContainer) {
    switch (state) {
      case 'initial':
          chartTitle
              .attr('transform', 'translate( ' + this.margin.left + ', 30)');
          timeSeriesContainer
              .attr('transform', 'translate( ' + this.margin.left + ', 0)');
          break;

      case 'next':
          timeSeriesContainer
              .attr('transform', 'translate( 1000, 0)')
              .transition()
              .attr('transform', 'translate( ' + this.margin.left + ', 0)');
          chartTitle
              .attr('transform', 'translate( 1000, 30)')
              .transition()
              .attr('transform', 'translate( ' + this.margin.left + ', 30)');
          break;

      case 'previous':
          timeSeriesContainer
              .attr('transform', 'translate( -1000, 0)')
              .transition()
              .attr('transform', 'translate( ' + this.margin.left + ', 0)');
          chartTitle
              .attr('transform', 'translate( -1000, 30)')
              .transition()
              .attr('transform', 'translate( ' + this.margin.left + ', 30)');
          break;
    }
  }

  private drawCanvasArea(rootEl, height: number, width: number) {
    return rootEl
      .append('div')
      .attr('class', 'graph draw_area')
      .append('svg')
      .attr('class', 'canvas_area')
      .attr('width', width + this.margin.left + this.margin.right)
      .attr('height', height + this.margin.top + this.margin.bottom);
  }

  private drawStartLines(rootEl, className: string, data: Array<IGanttData>, x: any, y: any) {
    return rootEl.append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + 0 + ')')
    .selectAll(`.${className}`)
      .data(data)
      .enter()
      .append('line')
      .attr('class', className)
      .attr('stroke', (d: IGanttData) => {
        // return d.color;
        return '#d9d9d9';
      })
      .style('stroke-width', 2)
      .attr('x1', (d: IGanttData) => {
          return x(new Date(d.start_date)) + 10;
      })
      .attr('x2', (d: IGanttData) => {
          return x(new Date(d.start_date)) + 10;
      })
      .attr('y1', 0)
      .attr('y2', (d, i) => {
          return (y(i + 1) + 20);
      });
  }

  private drawEndLines(rootEl, data: Array<IGanttData>, className: string, x: any, y: any) {
    return rootEl
      .selectAll(`.${className}`)
      .data(data)
      .enter()
      .append('line')
      .attr('stroke', (d: IGanttData) => {
        // return d.color;
        return '#d9d9d9';
      })
      .attr('stroke-width', 2)
      .attr('class', className)
      .attr('x1', (d: IGanttData) => {
          return x(new Date(d.end_date)) + 5;
      })
      .attr('x2', (d: IGanttData) => {
          return x(new Date(d.end_date)) + 5;
      })
      .attr('y1', 0)
      .attr('y2', (d, i) => {
          return (y(i + 1) + 20);
      });
  }

  private drawGridLines(rootEl, subheaderRanges: Array<any>, x: any, height: number) {
    const lines = rootEl
    .append('g')
    .attr('class', 'lines')
    .attr('transform', `translate(${this.margin.right},0)`);
    // add a toggle here
    lines.selectAll('.lines')
      .data(subheaderRanges)
      .enter()
      .append('line')
      .attr('class', 'date-line')
      .attr('x1', d => {
        return x(new Date(d.start_date));
      })
      .attr('x2', d => {
        return x(new Date(d.start_date));
      })
      .attr('y1', 0)
      .attr('y2', height);
    return lines;
  }

  private drawCurrentDayLine(rootEl, width: number, height: number, x1: number, x2: number) {
    return rootEl
      .append('line')
      .attr('width', 15)
      .attr('class', 'current-day-line')
      .attr('x1', x1)
      .attr('x2', x1)
      .attr('y1', 0)
      .attr('y2', height);
  }

  private drawTimeSeries(timeSeries, dateBoundary, subheaderRanges, x: any) {
    timeSeries
        .append('rect')
        .attr('x', x(new Date(dateBoundary.start_date)))
        .attr('width', Math.abs(x(new Date(dateBoundary.start_date)) - x(new Date(dateBoundary.end_date))))
        .attr('height', 40) // need to make header height configurable
        .attr('class', 'date-block-outline');

    timeSeries
        .append('g')
        .selectAll('.bar')
        .data(subheaderRanges)
        .enter()
        .append('rect')
        .attr('x', (d: IGanttData) => {
          return x(new Date(d.start_date));
        })
        .attr('width', (d: IGanttData) => {
          return this.getWidth(d, dateBoundary, x);
        })
        .attr('height', 40)
        .attr('class', (d: IGanttData) => {
            return 'date-block Date-' + moment(d.start_date).format('MMYYYY');
        });
    timeSeries
        .append('g')
        .selectAll('.bar')
        .data(subheaderRanges)
        .enter().append('text')
        .attr('x', d => {
          return (x(new Date(d.start_date)) + 10);
        })
        .attr('width', (d: IGanttData) => {
          return this.getWidth(d, dateBoundary, x);
        })
        .attr('y', 25) // make this part of config as well, lower pri
        .text( d => {
          return d.name;
        })
        .attr('class', d => {
            return 'date date-title date date-' + moment(d).format('MMYYYY');
        });
  }

  private renderWithNoData(rootEl, emptyBlockWidth: number, emptyBlockHeight: number, chartWidth: number) {
    const EmptyBlockX = ((chartWidth / 2) - (emptyBlockWidth / 2));
    const EMPTYBLOCK = rootEl
      .append('g')
      .attr('class', 'EmptyMessageBlock')
      .attr('transform', `translate(${EmptyBlockX}, 20)`);
    EMPTYBLOCK
        .append('rect')
        .attr('fill', 'transparent')
        .attr('x', 0)
        .attr('width', emptyBlockWidth)
        .attr('height', emptyBlockHeight);

    EMPTYBLOCK
        .append('text')
        .attr('class', 'EmptyMessage')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        // .attr('y', 25)
        .attr('y', emptyBlockHeight)
        .text('No data in chart.'); // make this a config

    const textBlock = EMPTYBLOCK.select('.EmptyMessage');
    const EmptyMessageWidth = textBlock.node().getComputedTextLength();
    const EmptyMessageX = Math.abs((emptyBlockWidth / 2) - (EmptyMessageWidth / 2));
    textBlock
      .attr('transform', 'translate(' + EmptyMessageX + ',20)');
  }

  private drawblockInfoContainer(rootEl, posX, blockInfoHeight: number, yFn: (idx) => number) {
    return rootEl.append('g')
      .attr('transform', (d, i) => {
        let position = posX;
        if (posX < 10) {
            position = 0;
        }
        return `translate( ${position}, ${(yFn(i + 1) + blockInfoHeight)})`;
      });
  }

  private drawblockInfoContent(rootEl, dateBoundary, blockInfoTextClass: string,
                               domainFn: (d: IGanttData) => number, durationFn: (d: IGanttData) => string) {
    // Subtitle
    rootEl.append('text')
          .attr('class', blockInfoTextClass)
          .text( (d) => {
            return d.subtitle;
          })
          .attr('opacity', (d: IGanttData) => {
            const durationOffset = this.calculateStringLengthOffset(d.subtitle);
            const width = this.getWidth(d, dateBoundary, domainFn);
            return Number(width > durationOffset);
          });
    // Duration
    rootEl.append('text')
            .attr('class', blockInfoTextClass)
            .attr('x', (d) => {
              return this.calculateStringLengthOffset(d.subtitle);
            })
            .text( (d) => {
              return `${durationFn(d)}`;
            })
            .attr('opacity', d => {
              return this.getDurationOpacity(d, dateBoundary, domainFn);
            });
  }

  private drawProgressBar(blockInfo, dateBoundary, domainFn: (d: IGanttData) => number, durationFn: (d: IGanttData) => string ) {
    // bar space
    blockInfo.append('rect')
        .attr('class', 'ProgressBar')
        .attr('fill', '#ddd')
        .attr('width', d => {
          const maxProgressBarWidth = 100;
          return d.completion_percentage === undefined ? 0 : maxProgressBarWidth;
        });
    // progressbar fill
    blockInfo.append('rect')
      .attr('class', 'ProgressBar ProgressBar-Fill')
      .attr('fill', 'red')
      .attr('width', d => {
          if (d.completion_percentage === undefined) {
            return 0;
          } else {
            const maxProgressBarWidth = 100;
            return ((d.completion_percentage * maxProgressBarWidth) / 100);
          }
      });
    blockInfo.selectAll('.ProgressBar')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('y', 20)
      .attr('height', 7)
      // .attr('x', d => {
      //   return this.calculateStringLengthOffset(d.subtitle)
      //     + this.calculateStringLengthOffset(durationFn(d));
      // })
      .attr('x', 0)
      .attr('opacity', d => {
          // const previousTextWidth = this.calculateStringLengthOffset(d.subtitle)
          // + this.calculateStringLengthOffset(durationFn(d))
          // + this.PROGRESSBAR_WIDTH;
          // return Number(widthFn(d) > previousTextWidth);
        return this.getProgressBarOpacity(d, dateBoundary, domainFn, durationFn);
      });
  }

  private getDateInfo(config: IGanttConfig) {
    let subheaderRanges: Array<IGanttCycle> = [];
    let months = [];
    let headerRanges = [];

    /* Setup Date Boundary */
    if (config.metrics.type === 'monthly') {
      months = [config.metrics.month];
      headerRanges = this.getMonthsRange(months);
      subheaderRanges = this.getDaysRange(months);
    } else if (config.metrics.type === 'overall') {
      const years = config.metrics.years;
      const yearsRange = [];
      years.map( year => {
          months = months.concat(this.getMonthsOftheYear(year));
          yearsRange.push(this.getYearBoundary(year));
      });
      headerRanges = [{
          name: 'Overall View',
          start_date: yearsRange[0].start_date,
          end_date: yearsRange[yearsRange.length - 1].end_date,
      }];
      subheaderRanges = yearsRange;

    } else {
      if (config.metrics.type === 'quarterly') {
        months = config.metrics.months;
        subheaderRanges = this.getMonthsRange(months);
        const year = moment(config.metrics.months[0], 'MMMM YYYY').format('YYYY');
        headerRanges = [{
            start_date: moment(config.metrics.months[0], 'MMMM YYYY').startOf('month').toDate(),
            end_date: moment(config.metrics.months[config.metrics.months.length - 1], 'MMMM YYYY').endOf('month').toDate(),
            name: year,
        }];
      } else if (config.metrics.type === 'yearly') {
        months = this.getMonthsOftheYear(config.metrics.year);
        subheaderRanges = this.getMonthsRange(months);
        headerRanges = [this.getYearBoundary(config.metrics.year)];
      } else if (config.metrics.type === 'sprint') {
        months = this.getMonthsOftheYear(config.metrics.year);
        subheaderRanges = config.metrics.cycles;
        headerRanges = [this.getYearBoundary(config.metrics.year)];
      }
    }
    return { subheaderRanges, headerRanges, months };
  }

  private drawBlockContainer(rootEl, className) {
    return rootEl
      .append('g')
      .attr('class', className)
      .attr('transform', 'translate(0, 20)');
  }

  private drawBlocks(rootEl, data, domainFn: (d) => number, className: string) {
    return rootEl.selectAll(`.${className}`)
        .data(data)
        .enter()
        .append('g')
        .attr('class', className)
        .attr('transform', (d, i)  => {
            return 'translate(' + domainFn(new Date(d.start_date)) + ',' + 0 + ')';
        });
  }

  private drawBlockRectangles(rootEl, className: string, blockHeight: number, xFn: (d) => number, yFn: (d) => number) {
    return rootEl
        .append('rect')
        .attr('class', className)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('height', blockHeight)
        .style('stroke-width', 2)
        .attr('x', 5)
        .attr('y', (d, i) => {
          return yFn(i + 1);
        })
        .attr('width', d => {
          return this.getActualWidth(d, xFn) + 5;
        });
  }

  private drawBlockContent(rootEl, className: string, dateBoundary, xFn: (d) => number) {
    return rootEl
      .append('g')
      .attr('class', className)
      .attr('transform', (d, i) => {
        if (this.startsBefore(d, dateBoundary.start_date) && this.getIsVisible(d, dateBoundary)) {
            const positionX = Math.abs(xFn(new Date(d.start_date)));
            return `translate(${positionX}, 0)`;
        } else {
            return 'translate(0, 0)';
        }
      });
  }

  private drawBlockTitle(rootEl, className, yFn: (d) => number, padding: number) {
    return rootEl.append('text')
      .attr('class', className)
      .attr('x', padding)
      .attr('y', (d, i) => {
          return (yFn(i + 1) + padding * 2);
      })
      .text( (d) => {
          return d.title;
      });
  }

  /* helper methods */
  private getProgressBarOpacity(d: IGanttData, dateBoundary, domainFn: (d: IGanttData) => number,
                                durationFn: (d: IGanttData) => string): number {
    const previousTextWidth = this.calculateStringLengthOffset(d.subtitle)
    + this.calculateStringLengthOffset(durationFn(d))
    + this.PROGRESSBAR_WIDTH;
    const width = this.getWidth(d, dateBoundary, domainFn);
    return Number(width > previousTextWidth);
  }

  private getDurationOpacity(d: IGanttData, dateBoundary, domainFn: (d: IGanttData) => number) {
    const durationOffset = this.calculateStringLengthOffset(d.subtitle);
    const width = this.getWidth(d, dateBoundary, domainFn);
    return Number(width > durationOffset);
  }

  // this entire method is wonky and broken
  private calculateStringLengthOffset(text: string) {
    const fontSizeOffset = 6.5; // this is goofy, need to convert string length to d3 domain units
    const paddingRight = 5;
    return text.length * fontSizeOffset + paddingRight;
  }

  private getMonthsOftheYear(year) {
    let months = moment.months();
    months = months.map( month => {
        month = month + ' ' + year;
        return month;
    });
    return months;
  }

  private getWidth(node: IGanttData, dateBoundary, domainFn: (d) => number) {
    let width = 0;
    if (this.endsAfter(node, dateBoundary.end_date)) {
      // width = Math.abs(x(new Date(dateBoundary.end_date)) - x(new Date(node.start_date)));
      width = this.getDomainDistance(dateBoundary.end_date, node.start_date, domainFn);
    } else if (this.startsBefore(node, dateBoundary.start_date)) {
        width = Math.abs(domainFn(new Date(dateBoundary.start_date)) - domainFn(new Date(node.end_date)));
        // width = this.getDomainDistance()
    } else {
        width = this.getActualWidth(node, domainFn);
    }
    return width;
  }

  private getActualWidth(node: { start_date: string | Date, end_date: string | Date }, domainFn: (d) => number) {
    return this.getDomainDistance(node.end_date, node.start_date, domainFn);
  }

  private getDomainDistance(point0: any, point1: any, domainFn: (d) => number, transformFn?: (d) => any ) {
    if (!transformFn) {
      transformFn = (d) => new Date(d);
    }
    return Math.abs( domainFn( transformFn(point0) ) - domainFn( transformFn(point1) ) );
  }

  private startsBefore(node: { start_date: string | Date}, dateLine: string | Date ) {
    return moment(node.start_date, 'MM/DD/YYYY').isBefore(dateLine);
  }

  private endsAfter(node: { end_date: string | Date}, dateLine: string | Date) {
    return moment(node.end_date, 'MM/DD/YYYY').isAfter(dateLine);
  }

  private getIsVisible(node: {start_date: any, end_date: any}, dateBoundary: { start_date: any, end_date: any }) {
    const startDateVisible = moment(node.start_date, 'MM/DD/YYYY').isBetween(dateBoundary.start_date, dateBoundary.end_date, 'days');
    const endDateVisible = moment(node.end_date, 'MM/DD/YYYY').isBetween(dateBoundary.start_date, dateBoundary.end_date, 'days');
    return startDateVisible || endDateVisible;
  }

  private getDaysRange(months) {
    const ranges: Array<IGanttCycle> = [];
    months.map((month) => {
        const startOfMonth = moment(month, 'MMM YYYY').startOf('month');
        const endOfMonth = moment(month, 'MMM YYYY').endOf('month');
        let day = startOfMonth;

        while (day <= endOfMonth) {
            ranges.push({
                name: moment(day).format('DD'),
                start_date: day.toDate(),
                end_date: day.clone().add(1, 'd').toDate(),
            });
            day = day.clone().add(1, 'd');
        }
      });
    return ranges;
  }

  private getMonthsRange(months) {
    const ranges = [];
    months.map(month => {
      const startOfMonth = moment(month, 'MMM YYYY').startOf('month');
      const endOfMonth = moment(month, 'MMM YYYY').endOf('month');
      ranges.push({
          name: moment(startOfMonth).format('MMM'),
          start_date: startOfMonth.toDate(),
          end_date: endOfMonth.clone().add(1, 'd').toDate(),
      });
    });
    return ranges;
  }

  private getYearBoundary(year) {
    const yearDate = moment(year, 'YYYY');
    const startOfYear = moment(yearDate).startOf('year');
    const endOfYear = moment(yearDate).endOf('year');
    return {
        name: year,
        start_date: startOfYear.toDate(),
        end_date: endOfYear.toDate(),
    };
  }

  // functions that need to be hoisted to play nicely
  private getDuration(d: IGanttData) {
    const startDate = moment(d.start_date, 'MM/DD/YYYY').format('DD MMM');
    const endDate = moment(d.end_date, 'MM/DD/YYYY').format('DD MMM');
    return startDate + ' - ' + endDate;
  }

  private trimTitle(entry: IGanttData, blockContent, blockTitleClass: string, width, padding) {
    // node should always  be blockContent
    const textBlock = (blockContent).selectAll(`.${blockTitleClass}`).filter((d: IGanttData) => {
      return d.id === entry.id;
    });
    textBlock.each((d: IGanttData, i) => {
      let textLength = textBlock.node().getComputedTextLength();
      let text = textBlock.text();
      while (textLength > (width - padding) && text.length > 0) {
        text = text.slice(0, -1);
        textBlock.text(text + '...');
        textLength = textBlock.node().getComputedTextLength();
      }
    });
  }

  /* end helper methods */

  public draw(state: string, data: Array<IGanttData>, config: IGanttConfig, elementId: string) {
    const dateBoundary: { start_date: Date | string, end_date: Date | string} = {
      start_date: '',
      end_date: ''
    };
    const ROOT_ELEMENT = d3.select(`#${elementId}`);
    const CHART_WIDTH = ROOT_ELEMENT._groups[0][0].offsetWidth;
    const EMPTYBLOCK_WIDTH = ((80 * CHART_WIDTH) / 100);
    const MAX_RECT_HEIGHT = 110;
    const CHART_HEIGHT = d3.max([((data.length * MAX_RECT_HEIGHT) + MAX_RECT_HEIGHT), 300]);


    /* Date Info/Boundary setup */
    const dateInfo: { subheaderRanges: Array<any>, months: Array<string>, headerRanges: Array<any> } = this.getDateInfo(config);
    const months = dateInfo.months;
    const subheaderRanges = dateInfo.subheaderRanges;
    const headerRanges = dateInfo.headerRanges;

    dateBoundary.start_date = moment(months[0], 'MMM YYYY').startOf('month').toDate();
    dateBoundary.end_date = moment(months[months.length - 1], 'MMM YYYY').endOf('month').toDate();
    /* End Date Info/Boundary Setup */

    /* Axis and Dimensions */
    const drawAreawidth = d3.max([CHART_WIDTH, 400]) - this.margin.left - this.margin.right;
    const height = CHART_HEIGHT - this.margin.top - this.margin.bottom;
    const x = this.getXScale(drawAreawidth, dateBoundary);
    const y = this.getYScale(height, data);

    const xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d3.timeFormat('%d/%m/%Y'));

    const yAxis = d3.axisLeft()
        .scale(y)
        .tickSize(0)
        .tickPadding(6);
    /* End Axis and Dimensions */
    /* Chart Background */
    const chartTitle = this.drawChartTitle(ROOT_ELEMENT, headerRanges, x, y, drawAreawidth, dateBoundary);
    const timeSeriesContainer = this.drawTimeSeriesContainer(ROOT_ELEMENT, drawAreawidth);
    this.drawTransitions(state, chartTitle, timeSeriesContainer);

    const canvasArea = this.drawCanvasArea(ROOT_ELEMENT, height, drawAreawidth);
    const startLineClassName = 'start-lines';
    const startLines = this.drawStartLines(canvasArea, startLineClassName, data, x, y);
    const endLineClassName = 'end-lines';
    const endLines = this.drawEndLines(canvasArea, data, endLineClassName, x, y);
    if (config.isShowGridlines) {
      this.drawGridLines(canvasArea, subheaderRanges, x, height);
    }

    this.drawCurrentDayLine(canvasArea,
      this.getActualWidth(this.currentDay, x),
      height,
      x(new Date(this.currentDay.start_date)),
      x(new Date(this.currentDay.start_date)));

    this.drawTimeSeries(timeSeriesContainer, dateBoundary, subheaderRanges, x);

    if (data.length === 0) {
      this.renderWithNoData(canvasArea, EMPTYBLOCK_WIDTH, this.EMPTYBLOCK_HEIGHT, CHART_WIDTH);
    }
    /* End Chart Background */
    /* Block Content */
    const blockHeight = MAX_RECT_HEIGHT - config.box_padding;
    const blockContainerClass = 'blocks';
    const blockContainer = this.drawBlockContainer(canvasArea, blockContainerClass);
    const blocksClass = 'gantt-entry-box'; // abstract up
    const Blocks = this.drawBlocks(blockContainer, data, x, blocksClass);
    const blockRectClass = 'gantt-entry-rect';
    const blockArea = this.drawBlockRectangles(Blocks, blockRectClass, blockHeight, x, y);
    const blockContentClass = 'gantt-entry';
    const blockContent = this.drawBlockContent(Blocks, blockContentClass, dateBoundary, x);
    const blockTitleClass = 'block-title';
    const blockTitle = this.drawBlockTitle(blockContent, blockTitleClass, y, config.box_padding);
    blockContent.each( (entry: IGanttData, i) => {
      const width = this.getWidth(entry, dateBoundary, x) + config.box_padding;
      this.trimTitle(entry, blockContent, blockTitleClass, width, config.box_padding);
    });
    /* End Block Content */
    /* blockInfo content, initially hidden */
    const blockInfoContainer = this.drawblockInfoContainer(blockContent, config.box_padding, 45, y);
    const blockInfoTextClass = 'block-info-text';
    this.drawblockInfoContent(blockInfoContainer, dateBoundary, blockInfoTextClass, x, this.getDuration);
    if (config.isShowProgressBar) {
      this.drawProgressBar(blockInfoContainer, dateBoundary, x, this.getDuration); // to add extra config
    }
    /* end of blockInfo content */

    // register reactivity
    Blocks
        .on('click', d => {
          config.onClick(d);
        })
        .on('mouseover', (d, i) => {
            Blocks.selectAll(`.${blockContentClass}`)
                .style('opacity', (b, i) => {
                    return (d.id === b.id) ? 1 : 0.3;
                });

            canvasArea.selectAll(`.${startLineClassName}, .${endLineClassName}`)
              .style('stroke-width', (b, i) => {
                  return (d.id === b.id) ? 3 : 2;
              })
              .style('stroke', (b, i) => {
                return (d.id === b.id) ? '#4894ff' : '#d9d9d9';
              });

            Blocks.selectAll(`.${blockRectClass}`)
              .style('stroke-width', b => {
                return d.id === b.id ? 2 : 1;
              })
              .style('stroke', b => {
                return d.id === b.id ? '#bbb' : '#ccc';
              })
              .attr('width', b => {
                  if (d.id === b.id) {
                    if (this.startsBefore(d, dateBoundary.start_date) || this.endsAfter(d, dateBoundary.end_date)) {
                      const width = this.getWidth(b, dateBoundary, x);
                      if (width < 500) {
                          // replace this 10 with config.box padding
                          return (this.getActualWidth(b, x) + (500 - width) + 10);
                        }
                    }
                    return ((d3.max([this.getActualWidth(b, x), 500])) + 10);
                  } else {
                    return this.getActualWidth(b, x);
                  }
              });

            Blocks.selectAll('.ProgressBar')
              .attr('opacity', b => {
                return Number(d.id === b.id || this.getWidth(b, dateBoundary, x) > 480);
              });

            Blocks.selectAll('.Duration')
              .attr('opacity', b => {
                if (b.id === d.id) {
                  return 1;
                } else {
                  return this.getDurationOpacity(b, dateBoundary, x);
                }
              });

            Blocks.selectAll('.TermType')
              .attr('opacity', (b) => {
                  return Number(d.id === b.id || this.getWidth(b, dateBoundary, x) > 80);
              });

            timeSeriesContainer.selectAll('.date')
              .style('fill', (b, i) => {
                  if (moment(b.start_date, 'MM/DD/YYYY').isBetween(d.start_date, d.end_date, 'days')
                  || moment(b.end_date, 'MM/DD/YYYY').isBetween(d.start_date, d.end_date, 'days')) {
                    return '#4894ff';
                  }
              });
            timeSeriesContainer.selectAll('.date-block')
              .style('fill', (b, i) => {
                  if (moment(b.start_date, 'MM/DD/YYYY').isBetween(d.start_date, d.end_date, 'days')
                  || moment(b.end_date, 'MM/DD/YYYY').isBetween(d.start_date, d.end_date, 'days')) {
                    return '#f0f6f9';
                  }
              });

            blockContent.filter((entry: IGanttData, i) => {
              return entry.id === d.id;
            })
            .selectAll(`.${blockTitleClass}`)
            .text( d => d.title );
        })
        .on('mouseout', (d, i) => {
            Blocks.selectAll(`.${blockContentClass}`)
                .style('opacity', 1);
            canvasArea.selectAll(`.${startLineClassName}, .${endLineClassName}`)
                .style('stroke-width', 2)
                .style('stroke', '#d9d9d9')
                .style('opacity', 1);

            Blocks.selectAll(`.${blockRectClass}`)
                .attr('width', b => {
                  // replace 10 with config.box padding
                  return this.getActualWidth(b, x) + 5;
                })
                .style('stroke', '#ccc')
                .style('stroke-width', 1);

            Blocks.selectAll('.ProgressBar')
                .attr('opacity', b => {
                  return this.getProgressBarOpacity(b, dateBoundary, x, this.getDuration);
                });

            Blocks.selectAll('.Duration')
                .attr('opacity', b => {
                  if (d.id === b.id) {
                    return this.getDurationOpacity(b, dateBoundary, x);
                  }
                });

            Blocks.selectAll('.TermType')
                .attr('opacity', b => {
                  return Number(this.getWidth(b, dateBoundary, x) > 80);
                });
            timeSeriesContainer.selectAll('.date')
                .style('fill', '');
            timeSeriesContainer.selectAll('.date-block')
                .style('fill', '');

            blockContent.filter((entry: IGanttData, i) => {
              return entry.id === d.id;
            }).each((entry: IGanttData, i) => {
              const width = this.getWidth(entry, dateBoundary, x) + config.box_padding;
              this.trimTitle(entry, blockContent, blockTitleClass, width, config.box_padding);
            });
        });

  }
}
