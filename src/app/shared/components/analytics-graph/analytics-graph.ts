import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import flatpickr from 'flatpickr';

@Component({
  selector: 'analytics-graph',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule, HighchartsChartModule],
  templateUrl: './analytics-graph.html',
  styleUrls: ['./analytics-graph.css']
})
export class AnalyticsGraph implements OnInit, OnChanges, AfterViewInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  
  chartInstance!: Highcharts.Chart;
  updateFlag: boolean = false; 
  oneToOneFlag: boolean = true; 

  @Input() title = "";
  @Input() isLoading: boolean = false;

  @Input() set graphData(data: any[]) {
    this._graphData = data;
    if (data && data.length > 0) {
      this.updateGraph();
    }
  }
  get graphData(): any[] { return this._graphData; }
  private _graphData: any[] = [];

  @Input() tableData: any[] = []; 
  @Output() dateFilterChanged = new EventEmitter<{ start: string, end: string }>();
  @ViewChild('datepicker', { static: false }) datepicker!: ElementRef;

  SENSOR_COLORS: { [key: string]: string } = {
    co: '#ffa600', so2: '#00c5ff', nox: '#ff0055', pm10: '#8c4af0', pm25: '#27ae60'
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.updateGraph(); 
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['graphData'] && !changes['graphData'].firstChange) || changes['tableData']) {
      this.updateGraph();
    }
  }

  ngAfterViewInit() {
    flatpickr(this.datepicker.nativeElement, {
      altInput: true,
      mode: 'range',
      dateFormat: 'Y-m-d'
    });
    
    setTimeout(() => {
      if (this.chartInstance) {
        this.chartInstance.reflow();
      }
    }, 500);
  }

  chartCallback: Highcharts.ChartCallbackFunction = (chart) => {
    this.chartInstance = chart;
  };

  applyFilter(dateInput: string) {
    console.log('Filter applied for:', this.title, 'Value:', dateInput); // Debug check
  
    if (!dateInput || !dateInput.includes("to")) {
      console.warn('Invalid date range');
      return;
    }
    
    const [start, end] = dateInput.split("to").map(d => d.trim());
    this.dateFilterChanged.emit({ start, end });
  }

  updateGraph() {
    if (!this.graphData || this.graphData.length === 0) return;

    const allKeys = Object.keys(this.graphData[0]);
    const sensorKeys = allKeys.filter(key => 
      !['Date', 'Time', 'name', 'displayTime'].includes(key)
    );

    // Update Table Data
    this.tableData = sensorKeys.map(key => {
      const values = this.graphData.map(d => d[key]).filter(v => typeof v === 'number');
      return {
        component: key,
        avg: values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '--',
        min: values.length ? Math.min(...values).toFixed(2) : '--',
        max: values.length ? Math.max(...values).toFixed(2) : '--',
        limit: 'N/A',
        unit: 'ppm'
      };
    });

    // Create Series
    const dynamicSeries: Highcharts.SeriesOptionsType[] = sensorKeys.map(key => ({
      name: key,
      type: 'line',
      data: this.graphData.map(d => d[key] ?? 0),
      color: this.SENSOR_COLORS[key.toLowerCase()] || undefined,
      marker: { enabled: false }, 
      lineWidth: 1.5
    }));

    // Define Chart Options
    this.chartOptions = {
      chart: { 
        height: 320, 
        spacingBottom: 15,
        marginTop: 10,
        backgroundColor: 'transparent'
      },
      title: { text: '' },
      credits: { enabled: false },
      tooltip: { 
        shared: true, 
        outside: true 
      },
      legend: {
        enabled: true,
        verticalAlign: 'bottom',
        layout: 'horizontal',
        maxHeight: 80, // Slightly taller to see more sensors
        itemStyle: { fontSize: '10px', fontWeight: 'normal' },
        navigation: {
          activeColor: '#1e3a8a',
          arrowSize: 12
        }
      },
      xAxis: {
        categories: this.graphData.map(d => d.name),
        crosshair: true,
        labels: { 
          rotation: -45, 
          style: { fontSize: '9px' } 
        }
      },
      yAxis: { 
        title: { text: null },
        gridLineDashStyle: 'Dash',
        labels: { style: { fontSize: '10px' } }
      },
      series: dynamicSeries,
      plotOptions: {
        line: { 
          animation: false,
          events: {
            legendItemClick: function () {
             
            }
          }
        },
        series: { 
          states: { 
            inactive: { opacity: 0.2 }
          } 
        }
      }
    };

    this.updateFlag = true;
    this.cdr.detectChanges();
  }
}