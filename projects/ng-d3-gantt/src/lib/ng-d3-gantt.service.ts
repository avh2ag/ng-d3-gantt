import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { IGanttConfig, IGanttData, IGanttCycle } from './ng-d3-gantt.interface';
import * as moment_ from 'moment';
const moment = moment_;

// tslint:disable: no-shadowed-variable
@Injectable({
  providedIn: 'root'
})
export class NgD3GanttService {
  private margin: { top: number, right: number, bottom: number, left: number };
  private currentDay: { start_date: Date, end_date: Date };

  constructor() {
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
        case 'fiscal':
          config.metrics.year = config.metrics.year + 1;
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
        case 'fiscal':
          config.metrics.year = config.metrics.year - 1;
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

  private drawChartTitle(rootEl, headerRanges, x, y, width: number, dateBoundary, dateFormat: string) {
    const chartTitle = rootEl
      .append('div')
      .attr('class', 'graph chart-title')
      .append('svg')
      .attr('width', width + this.margin.left + this.margin.right)
      .attr('height', '100%')
      .append('g');
    const titleText = chartTitle.selectAll('.bar')
      .data(headerRanges)
      .enter().append('text')
      .attr('class', 'first-title')
      .attr('y', -5)
      .attr('x', (d) => {
        return x(new Date(d.start_date)) + (this.getWidth(d, dateBoundary, x, dateFormat) / 2);
      })
      .attr('width', (d) => {
        return this.getWidth(d, dateBoundary, x, dateFormat);
      })
      .attr('height', y.bandwidth())
      .text( d => {
        return d.name;
      });
    const titleTextWidth = titleText.node().getComputedTextLength() * 1.5;
    const titleMessageX = Math.abs((titleTextWidth / 2));
    titleText
        .attr('transform', `translate(${-1 * titleMessageX}, 0)`);
    return chartTitle;
  }

  private drawTimeSeriesContainer(rootEl, width: number) {
    return rootEl
      .append('div')
      .attr('class', 'graph time-series')
      .append('svg')
      .attr('width', width + this.margin.left + this.margin.right)
      .attr('height', '100%')
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
      .attr('x1', (d: IGanttData) => {
          return x(new Date(d.start_date)) + 10;
      })
      .attr('x2', (d: IGanttData) => {
          return x(new Date(d.start_date)) + 10;
      })
      .attr('y1', 0)
      .attr('y2', (d, i) => {
          return (y(i + 1) + 20);
      })
      .attr('transform', `translate(-2, 0)`);
  }

  private drawEndLines(rootEl, data: Array<IGanttData>, className: string, x: any, y: any) {
    return rootEl
      .selectAll(`.${className}`)
      .data(data)
      .enter()
      .append('line')
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
    rootEl
      .append('line')
      .attr('class', 'current-day-line')
      .attr('x1', x1)
      .attr('x2', x1)
      .attr('y1', 0)
      .attr('y2', height);
    const circleRadius = 6;

    rootEl.append('circle')
      .attr('class', 'current-day-anchor')
      .attr('cx', x1)
      .attr('cy', circleRadius)
      // .attr('transform', `translate(${x1}, ${circleRadius})`)
      .attr('r', circleRadius)
      /* tslint:disable-next-line */
      .on('mouseover', function() {
        tooltip.style('visibility', 'visible');
      })
      /* tslint:disable-next-line */
      .on('mouseout', function() {
        tooltip.style('visibility', 'hidden');
      });
    const tooltip =  rootEl
      .append('text')
      .attr('x', x1 + circleRadius)
      .attr('y', circleRadius * 4)
      .attr('class', 'tooltip')
      .style('visibility', 'hidden')
      .text('Today');
  }

  private drawTimeSeries(timeSeries, dateBoundary, subheaderRanges, x: any, dateFormat: string) {
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
          return this.getActualWidth(d, x);
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
          const rectWidth = this.getActualWidth(d, x);
          return (x(new Date(d.start_date)) + (rectWidth / 2) - 3);
        })
        .attr('y', 25) // make this part of config as well, lower pri
        .text( d => {
          return d.name;
        })
        .attr('class', d => {
            return ' date-title date date-' + moment(d).format('MMYYYY');
        });
  }

  private renderWithNoData(rootEl, emptyBlockWidth: number, emptyBlockHeight: number, chartWidth: number, emptyText: string) {
    const EmptyBlockX = ((chartWidth / 2) - (emptyBlockWidth / 2));
    const emptyBlockPos = emptyBlockHeight - emptyBlockHeight / 5;
    const EMPTYBLOCK = rootEl
      .append('g')
      .attr('class', 'empty-message-block')
      .attr('transform', `translate(${EmptyBlockX}, ${emptyBlockPos})`);

    const textBlock = EMPTYBLOCK
        .append('text')
        .attr('class', 'empty-message')
        .text(emptyText); // make this a config

    const EmptyMessageWidth = textBlock.node().getComputedTextLength();
    const EmptyMessageX = Math.abs((emptyBlockWidth / 2) - (EmptyMessageWidth / 2));
    textBlock
      .attr('transform', `translate(${EmptyMessageX}, ${emptyBlockPos})`);
  }

  private drawblockInfoContainer(rootEl, boxPadding, className: string, blockInfoHeight: number, yFn: (idx) => number) {
    return rootEl
      .append('g')
      .attr('class', className)
      .attr('transform', (d, i) => {
        return `translate( ${boxPadding}, ${(yFn(i + 1) + blockInfoHeight)})`;
      });
  }

  private drawblockInfoContent(rootEl, dateBoundary, blockInfoTextClass: string, dateFormat: string,
                               domainFn: (d: IGanttData) => number,
                               durationFn: (d: IGanttData, dateFormat: string) => string) {
    // Subtitle
    const subtitleHeight = 12;
    const subtitle = rootEl.append('text')
          .attr('class', `${blockInfoTextClass} subtitle`)
          .text( (d) => {
            return d.subtitle;
          }).attr('height', subtitleHeight);
    // Duration
    const subtitlePaddingY = 8;
    const durationPosition = subtitleHeight * 1.5 + subtitlePaddingY;
    rootEl.append('text')
            .attr('class', `${blockInfoTextClass} duration`)
            .attr('y', durationPosition)
            .text( (d) => {
              return `${durationFn(d, dateFormat)}`;
            });
  }

  private drawProgressBar(blockInfo, dateBoundary,
                          domainFn: (d: IGanttData) => number,
                          durationFn: (d: IGanttData, dateFormat: string) => string, dateFormat: string) {
    // bar space
    blockInfo.append('rect')
        .attr('class', 'progress-bar')
        .attr('width', d => {
          const maxProgressBarWidth = this.getWidth(d, dateBoundary, domainFn, dateFormat) * .9;
          return d.completion_percentage === undefined ? 0 : maxProgressBarWidth;
        });
    // progressbar fill
    blockInfo.append('rect')
      .attr('class', 'progress-bar progress-bar-fill')
      .attr('width', d => {
          if (d.completion_percentage === undefined) {
            return 0;
          } else {
            const maxProgressBarWidth = this.getWidth(d, dateBoundary, domainFn, dateFormat) * .9;
            return ((d.completion_percentage * maxProgressBarWidth) / 100);
          }
      });
    blockInfo.selectAll('.progress-bar')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('y', 30)
      .attr('height', 7)
      .attr('x', 0);
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
        // const year = moment(config.metrics.months[0], 'MMMM YYYY').format('YYYY');
        headerRanges = [{
            start_date: moment(config.metrics.months[0], 'MMMM YYYY').startOf('month').toDate(),
            end_date: moment(config.metrics.months[config.metrics.months.length - 1], 'MMMM YYYY').endOf('month').toDate(),
            name: '',
        }];
      } else if (config.metrics.type === 'yearly') {
        months = this.getMonthsOftheYear(config.metrics.year);
        subheaderRanges = this.getMonthsRange(months);
        headerRanges = [this.getYearBoundary(config.metrics.year)];
      } else if (config.metrics.type === 'fiscal') {
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

  private drawBlocks(rootEl, data, domainFn: (d) => number, className: string, dateBoundary, dateFormat: string) {
    return rootEl.selectAll(`.${className}`)
        .data(data)
        .enter()
        .append('g')
        .attr('class', className)
        .attr('id', (d, i) => {
          return this.getBlockId(d);
        })
        .attr('transform', (d, i)  => {
          // reset start date to minimum date for drawing the block if going to be included
          const startDate = this.startsBefore(d, dateBoundary.start_date, dateFormat) ? dateBoundary.start_date : d.start_date;
          return 'translate(' + domainFn(new Date(startDate)) + ',' + 0 + ')';
        });
  }

  private getBlockId(d: IGanttData) {
    return `block-${d.id}`;
  }

  private drawBlockRectangles(rootEl, className: string, blockHeight: number, progressBarContainerHeight: number,
                              xFn: (d) => number, yFn: (d) => number, dateBoundary, dateFormat) {
    const primaryRect = rootEl
        .append('rect')
        .attr('class', className)
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('height', (d, i) => {
          return d.completion_percentage ? blockHeight : blockHeight - progressBarContainerHeight;
        })
        .attr('x', 5)
        .attr('y', (d, i) => {
          return yFn(i + 1);
        })
        .attr('width', d => {
          return this.getWidth(d, dateBoundary, xFn, dateFormat) + 5; // max out as max width
        });
    const colorCode = rootEl.append('rect')
      .attr('class', 'color-code')
      .attr('x', 5)
      .attr('y', (d, i) => {
        return yFn(i + 1);
      })
      .attr('height', (d, i) => {
        if (d.color && d.color.length > 0) {
          return d.completion_percentage ? blockHeight : blockHeight - progressBarContainerHeight;
        } else {
          return 0;
        }
      })
      .attr('width', 4)
      .style('fill', (d, i) => {
        return d.color && d.color.length > 0 ? d.color : 'transparent';
      });
    return primaryRect;
  }

  private drawBlockContent(rootEl, className: string, boxPadding: number, dateBoundary, xFn: (d) => number, dateFormat: string) {
    return rootEl
      .append('g')
      .attr('class', className)
      .attr('transform', (d, i) => {
        if (this.startsBefore(d, dateBoundary.start_date, dateFormat) && this.getIsVisible(d, dateBoundary)) {
          const positionX = Math.abs(xFn(new Date(d.start_date))) + boxPadding;
          return `translate(${positionX}, ${boxPadding})`;
        } else {
          return `translate(${boxPadding}, ${boxPadding})`;
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
  // this entire method is wonky and broken
  private calculateStringLengthOffset(text: string, fontSize: number) {
    const paddingRight = 5;
    return text.length * fontSize + paddingRight;
  }

  private getMonthsOftheYear(year) {
    let months = moment.months();
    months = months.map( month => {
        month = month + ' ' + year;
        return month;
    });
    return months;
  }

  private getWidth(node: IGanttData, dateBoundary, domainFn: (d) => number, dateFormat: string) {
    let width = 0;
    if (this.endsAfter(node, dateBoundary.end_date)) {
      // width = Math.abs(x(new Date(dateBoundary.end_date)) - x(new Date(node.start_date)));
      width = this.getDomainDistance(dateBoundary.end_date, node.start_date, domainFn);
    } else if (this.startsBefore(node, dateBoundary.start_date, dateFormat)) {
      // width = Math.abs(domainFn(new Date(dateBoundary.start_date)) - domainFn(new Date(node.end_date)));
      width = this.getDomainDistance(node.end_date, dateBoundary.start_date, domainFn);
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

  private startsBefore(node: { start_date: string | Date}, dateLine: string | Date, dateFormat: string ) {
    return moment(node.start_date, dateFormat).isBefore(dateLine);
  }

  private endsAfter(node: { end_date: string | Date}, dateLine: string | Date) {
    return moment(node.end_date, 'MM/DD/YYYY').isAfter(dateLine);
  }

  private getIsVisible(node: {start_date: any, end_date: any}, dateBoundary: { start_date: any, end_date: any }) {
    const startDateVisible = moment(node.start_date, 'MM/DD/YYYY').isAfter(new Date(dateBoundary.start_date));
    const endDateVisible = moment(node.end_date, 'MM/DD/YYYY').isBefore(new Date(dateBoundary.end_date));
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

  private getDuration(d: IGanttData, dateFormat: string, displayFormat?: string) {
    if (!displayFormat) {
      displayFormat = 'MMM DD YYYY';
    }
    const startDate = moment(d.start_date, dateFormat).format(displayFormat);
    const endDate = moment(d.end_date, dateFormat).format(displayFormat);
    return startDate + ' - ' + endDate;
  }

  private trimTitle(entry: IGanttData, rootEl, className: string, width, padding) {
    const textBlock = (rootEl).selectAll(`.${className}`).filter((d: IGanttData) => {
      return d.id === entry.id;
    });
    textBlock.each((d: IGanttData, i) => {
      let textLength = textBlock.node().getComputedTextLength();
      let text = textBlock.text();
      while (textLength > (width - padding - 10) && text.length > 0) {
        text = text.slice(0, -1);
        textBlock.text(text + '...');
        textBlock.attr('is-clipped', 'clipped');
        textLength = textBlock.node().getComputedTextLength();
      }
    });
  }

  private getLongestFieldName(d: IGanttData, dateFormat: string) {
    const titleLen = d.title.length;
    const subtitleLen = d.subtitle.length;
    const duration = this.getDuration(d, dateFormat);
    const durationLen = duration.length;
    if (subtitleLen > durationLen) {
      if (titleLen > subtitleLen && subtitleLen > durationLen) {
        return 'title';
      } else {
        return 'subtitle';
      }
    } else {
      if (durationLen > titleLen) {
        return 'duration';
      } else {
        return 'title';
      }
    }
  }
  private getFontSize(parentEl, selector: string): number {
    return parseFloat(parentEl.select(selector).style('font-size'));
  }
  private getIsBetween(date, dateRange, dateFormat: string) {
    return (moment(date.start_date, dateFormat).isBetween(dateRange.start_date, dateRange.end_date, 'days')
    || moment(date.end_date, dateFormat).isBetween(dateRange.start_date, dateRange.end_date, 'days'));
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
    const defaultHeight = 100;
    const progressBarContainerHeight = 10;
    const MAX_RECT_HEIGHT = config.isShowProgressBar ? defaultHeight : defaultHeight - progressBarContainerHeight;
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
    const chartTitle = this.drawChartTitle(ROOT_ELEMENT, headerRanges, x, y, drawAreawidth, dateBoundary, config.dateFormat);
    const timeSeriesContainer = this.drawTimeSeriesContainer(ROOT_ELEMENT, drawAreawidth);
    // need to update for if yearly, then return the offset
    this.drawTransitions(state, chartTitle, timeSeriesContainer);

    const canvasArea = this.drawCanvasArea(ROOT_ELEMENT, height, drawAreawidth);
    const startLineClassName = 'start-lines';
    const startLines = this.drawStartLines(canvasArea, startLineClassName, data, x, y);
    const endLineClassName = 'end-lines';
    const endLines = this.drawEndLines(canvasArea, data, endLineClassName, x, y);
    if (config.isShowGridlines) {
      this.drawGridLines(canvasArea, subheaderRanges, x, height);
    }
    const isDrawCurrentDayLine = moment(this.currentDay.start_date)
      .isBetween(moment(dateBoundary.start_date), moment(dateBoundary.end_date));
    if (isDrawCurrentDayLine) {
      this.drawCurrentDayLine(canvasArea,
        this.getActualWidth(this.currentDay, x),
        height,
        x(new Date(this.currentDay.start_date)),
        x(new Date(this.currentDay.start_date))
      );
    }


    this.drawTimeSeries(timeSeriesContainer, dateBoundary, subheaderRanges, x, config.dateFormat);

    if (data.length === 0) {
      const emptyText = config.emptyText ? config.emptyText : 'No data in chart';
      this.renderWithNoData(canvasArea, EMPTYBLOCK_WIDTH, 150, CHART_WIDTH, emptyText);
    }
    /* End Chart Background */
    /* Block Content */
    const blockHeight = MAX_RECT_HEIGHT - config.box_padding;
    const blockContainerClass = 'blocks';
    const blockContainer = this.drawBlockContainer(canvasArea, blockContainerClass);
    const blocksClass = 'gantt-entry-box'; // abstract up
    const Blocks = this.drawBlocks(blockContainer, data, x, blocksClass, dateBoundary, config.dateFormat);
    const blockRectClass = 'gantt-entry-rect';
    const blockArea = this.drawBlockRectangles(Blocks, blockRectClass, blockHeight,
        progressBarContainerHeight, x, y, dateBoundary, config.dateFormat);
    const blockContentClass = 'gantt-entry';
    const blockContent = this.drawBlockContent(Blocks, blockContentClass, config.box_padding, dateBoundary, x, config.dateFormat);
    const blockTitleClass = `title`;
    const blockTitle = this.drawBlockTitle(blockContent, blockTitleClass, y, config.box_padding);
    const blockInfoClass = 'block-info';
    const blockInfoContainer = this.drawblockInfoContainer(blockContent, config.box_padding, blockInfoClass, 26 + config.box_padding, y);
    const blockInfoTextClass = 'block-info-text';
    this.drawblockInfoContent(blockInfoContainer, dateBoundary, blockInfoTextClass, config.dateFormat, x, this.getDuration);
    if (config.isShowProgressBar) {
      this.drawProgressBar(blockInfoContainer, dateBoundary, x, this.getDuration, config.dateFormat); // to add extra config
    }
    blockContent.each( (entry: IGanttData, i) => {
      const width = this.getWidth(entry, dateBoundary, x, config.dateFormat) + config.box_padding;
      this.trimTitle(entry, blockContent, blockTitleClass, width, config.box_padding);
    });
    blockInfoContainer.each( (entry: IGanttData, i) => {
      const width = this.getWidth(entry, dateBoundary, x, config.dateFormat) + config.box_padding;
      this.trimTitle(entry, blockInfoContainer, 'subtitle', width, config.box_padding);
      this.trimTitle(entry, blockInfoContainer, 'duration', width, config.box_padding);
    });
    /* End Block Content  */

    // register reactivity
    Blocks
        .on('click', d => {
          config.onClick(d);
        })
        .on('mouseover', (d, i) => {
          const filteredEntry = blockContent.filter((entry: IGanttData, i) => {
            return entry.id === d.id;
          });
          filteredEntry.selectAll(`.${blockTitleClass}`)
            .text( d => d.title );
          filteredEntry.selectAll(`.duration`)
            .text(d => {
              return this.getDuration(d, config.dateFormat);
            });
          filteredEntry.selectAll('.subtitle')
            .text(d => {
              return d.subtitle;
          });
          const filteredRects = Blocks.filter( (entry: IGanttData) => {
            return entry.id === d.id;
          })
            .selectAll(`.${blockRectClass}`)
            .attr('class', `${blockRectClass} active`)
            .attr('width', b => {
              const width = this.getWidth(b, dateBoundary, x, config.dateFormat);
              const longestFieldName = this.getLongestFieldName(b, config.dateFormat); // switch this to return the field
              const longestFieldNode = filteredEntry.select(`.${longestFieldName}`);
              const isClippedText = longestFieldNode.attr('is-clipped');
              if (isClippedText) {
                const textWidth = longestFieldNode.node().getComputedTextLength();
                return width + textWidth + config.box_padding;
              } else {
                return width;
              }
            });
          // leave this behavior as canon
          Blocks.selectAll(`.${blockContentClass}`)
              .style('opacity', (b, i) => {
                  return (d.id === b.id) ? 1 : 0.3;
              });

          canvasArea.selectAll(`.${startLineClassName}, .${endLineClassName}`)
            .filter((entry: IGanttData) => {
              return entry.id === d.id;
            })
            .attr('class', `active ${startLineClassName} ${endLineClassName}`);

          Blocks.selectAll('.TermType')
            .attr('opacity', (b) => {
                return Number(d.id === b.id || this.getWidth(b, dateBoundary, x, config.dateFormat) > 80);
            });

          timeSeriesContainer.selectAll('.date')
            .filter( (b, i) => {
              return this.getIsBetween(b, d, config.dateFormat);
            })
            .attr('class', 'date active');

          const activeDates = timeSeriesContainer.selectAll('.date-block')
            .filter( (b, i) => {
              return this.getIsBetween(b, d, config.dateFormat);
            })
            .attr('class', 'date-block active');

        })
        .on('mouseout', (d, i) => {
            Blocks.selectAll(`.${blockContentClass}`)
                .style('opacity', 1);
            canvasArea.selectAll(`.${startLineClassName}`)
              .attr('class', startLineClassName);
            canvasArea.selectAll(`.${endLineClassName}`)
              .attr('class', endLineClassName);

            Blocks.selectAll(`.${blockRectClass}`)
                .attr('class', `${blockRectClass}`)
                .attr('width', b => {
                  return this.getWidth(b, dateBoundary, x, config.dateFormat) + config.box_padding;
                });

            Blocks.selectAll('.TermType')
                .attr('opacity', b => {
                  return Number(this.getWidth(b, dateBoundary, x, config.dateFormat) > 80);
                });
            timeSeriesContainer.selectAll('.date.active').attr('class', 'date');
            timeSeriesContainer.selectAll('.date-block').attr('class', 'date-block');

            blockContent.each( (entry: IGanttData, i) => {
              if (d.id === entry.id) {
                const width = this.getWidth(entry, dateBoundary, x, config.dateFormat) + config.box_padding;
                this.trimTitle(entry, blockContent, blockTitleClass, width, config.box_padding);
              }
            });
            blockInfoContainer.each( (entry: IGanttData, i) => {
              if (d.id === entry.id) {
                const width = this.getWidth(entry, dateBoundary, x, config.dateFormat) + config.box_padding;
                this.trimTitle(entry, blockInfoContainer, 'subtitle', width, config.box_padding);
                this.trimTitle(entry, blockInfoContainer, 'duration', width, config.box_padding);
              }
            });
        });

  }
}
