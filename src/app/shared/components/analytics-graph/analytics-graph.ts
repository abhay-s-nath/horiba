import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsDirective } from 'ngx-echarts';
import flatpickr from 'flatpickr';

@Component({
  selector: 'analytics-graph',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule, NgxEchartsDirective],
  templateUrl: './analytics-graph.html',
  styleUrls: ['./analytics-graph.css']
})
export class AnalyticsGraph implements OnInit, OnChanges, AfterViewInit {

  @Input() title = "";
  
  // Using a setter to trigger updates when data flows in
  @Input() set graphData(data: any[]) {
    this._graphData = data;
    if (data && data.length > 0) {
      // Use requestAnimationFrame or setTimeout to ensure the DOM is ready for ECharts
      setTimeout(() => this.updateGraph(), 50);
    }
  }
  get graphData(): any[] {
    return this._graphData;
  }
  private _graphData: any[] = [];

  @Input() tableData: any[] = []; 

  @Output() dateFilterChanged = new EventEmitter<{ start: string, end: string }>();

  @ViewChild('datepicker', { static: false }) datepicker!: ElementRef;

  options: any; 

  SENSOR_COLORS = {
    co: '#ffa600',
    so2: '#00c5ff',
    nox: '#ff0055',
    pm10: '#8c4af0',
    pm25: '#27ae60'
  };

  ngOnInit() {
    this.updateGraph(); 
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detect changes in tableData or graphData updates
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
  }

  applyFilter() {
    const dateInput: string = this.datepicker.nativeElement.value;
    if (!dateInput || !dateInput.includes("to")) {
      console.warn("Invalid date range selected");
      return;
    }
    const [start, end] = dateInput.split("to").map(d => d.trim());
    this.dateFilterChanged.emit({ start, end });
  }

  /**
   * Helper to find a value in the data object even if the key is a long string 
   * (e.g., finding "CO" inside "Airmo-VOC-BTEX_1.3 Butadine")
   */
  private getValueByKeyword(dataObj: any, keyword: string): number {
    const key = Object.keys(dataObj).find(k => k.toLowerCase().includes(keyword.toLowerCase()));
    return key ? dataObj[key] : 0;
  }

  updateGraph() {
    if (!this.graphData || this.graphData.length === 0) {
      this.options = {};
      return;
    }
  
    const allKeys = Object.keys(this.graphData[0]);
    const sensorKeys = allKeys.filter(key => 
      !['Date', 'Time', 'name', 'displayTime'].includes(key)
    );
  
    // 1. Table Statistics (Now working in your screenshot)
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
  
    // 2. Clean Graph Series
    const dynamicSeries = sensorKeys.map(key => ({
      name: key,
      type: 'line',
      data: this.graphData.map(d => d[key] ?? 0),
      symbol: 'circle', 
      symbolSize: 4,      // Small dots at data points
      smooth: false,      // CRITICAL: Set to false to remove "wavy" artificial curves
      lineStyle: { 
        width: 1.5,
        opacity: 0.7      // Slight transparency helps see overlapping lines
      }
    }));
  
    // 3. Optimized Layout Options
    this.options = {
      animation: false,   // Better performance for 70+ lines
      tooltip: { trigger: 'axis', confine: true },
      legend: {
        type: 'scroll',
        top: 0, // Keep legend at the very top
        padding: [0, 5]
      },
      grid: { 
        top: 40,    // Space for legend
        bottom: 40, // Reduced from 80. This is the "Gap" creator!
        left: 45,   
        right: 15,
        containLabel: true 
      },
      xAxis: {
        type: 'category',
        data: this.graphData.map(d => d.name),
        axisLabel: { 
          rotate: 0, // If you have few points, keep it 0 to save space
          fontSize: 10,
          margin: 8 // Space between axis and labels
        }},
      yAxis: { 
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed' } }
      },
      series: dynamicSeries
    };
  }
}