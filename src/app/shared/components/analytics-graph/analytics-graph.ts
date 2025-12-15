import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEchartsDirective } from 'ngx-echarts';
import flatpickr from 'flatpickr';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'analytics-graph',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, NgxEchartsDirective],
  templateUrl: './analytics-graph.html',
  styleUrls: ['./analytics-graph.css']
})
// Implement OnChanges to detect when data arrives
export class AnalyticsGraph implements OnInit, OnChanges, AfterViewInit {

  @Input() title = "";
  // The setter will automatically trigger updateGraph when data is passed in
  @Input() set graphData(data: any[]) {
      this._graphData = data;
      // Only update the graph if data is present
      if (data && data.length > 0) {
        setTimeout(() => { 
          this.updateGraph(); 
      }, 50);      }
  }
  get graphData(): any[] {
      return this._graphData;
  }
  private _graphData: any[] = [];

  @Input() tableData: any[] = []; // tableData automatically updates the HTML via ngFor

  @Output() dateFilterChanged = new EventEmitter<{ start: string, end: string }>();

  @ViewChild('datepicker', { static: false }) datepicker!: ElementRef;

  options: any; // ECharts options object

  SENSOR_COLORS = {
    co: '#ffa600',
    so2: '#00c5ff',
    nox: '#ff0055',
    pm10: '#8c4af0',
    pm25: '#27ae60'
  };

  ngOnInit() {
    // Initialize with a basic, empty chart structure
    this.updateGraph(); 
  }

  // Use OnChanges to listen for initial data load or update
  ngOnChanges(changes: SimpleChanges): void {
      if (changes['graphData'] && changes['graphData'].currentValue.length > 0) {
          // The setter handles the update, but this ensures tableData is also reflected
          // if it changes separately.
          setTimeout(() => {
            this.updateGraph();
        }, 50);
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
    console.log("Emitted:", { start, end });
  }

  // NEW METHOD: Contains all ECharts configuration logic
  updateGraph() {
    const xLabels = this.graphData.map(d => d.time ?? d.day);

    // Select dynamic subtitle based on card title
    const subText =
      this.title.includes("DAY") ? "Data (hourly)" :
      this.title.includes("WEEK") ? "Data (hourly for 7 days)" :
      "Data (hourly for the last 30 days)";

    this.options = {
      tooltip: { trigger: 'axis' },

      title: {
        text: `Air Quality & Sensor Readings — ${this.title.includes("DAY") ? "1 Day" :
                                                this.title.includes("WEEK") ? "1 Week" : "1 Month"}`,
        left: 12,
        top: 8,
        textStyle: {
          fontSize: 14,
          fontWeight: 600,
          color: "#2b2b2b"
        },
        subtext: subText,
        subtextStyle: {
          fontSize: 11,
          color: "#777"
        }
      },

      legend: {
        top: 40,
        right: 15,
        itemHeight: 8,
        itemWidth: 14,
        textStyle: {
          fontSize: 11,
          color: "#333"
        }
      },

      grid: {
        top: 95,
        left: 45,
        right: 35,
        bottom: 50
      },

      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          fontSize: 10,
          color: "#555",
          rotate: 0
        },
        data: xLabels // Populated from the current graphData
      },

      yAxis: {
        type: 'value',
        name: "Measurement (units/day)",
        nameLocation: "middle",
        nameTextStyle: {
          fontSize: 11,
          color: "#555"
        },
        nameGap: 45,
        axisLabel: {
          fontSize: 10,
          color: "#555"
        }
      },

      series: [
        // Ensure data keys match the dummy data (d.co, d.so2, etc.)
        { name: 'CO', type: 'line', data: this.graphData.map(d => d.co), color: this.SENSOR_COLORS.co, symbolSize: 3, lineStyle: { width: 1.8 } },
        { name: 'SO₂', type: 'line', data: this.graphData.map(d => d.so2), color: this.SENSOR_COLORS.so2, symbolSize: 3, lineStyle: { width: 1.8 } },
        { name: 'NOx', type: 'line', data: this.graphData.map(d => d.nox), color: this.SENSOR_COLORS.nox, symbolSize: 3, lineStyle: { width: 1.8 } },
        { name: 'PM10', type: 'line', data: this.graphData.map(d => d.pm10), color: this.SENSOR_COLORS.pm10, symbolSize: 3, lineStyle: { width: 1.8 } },
        { name: 'PM2.5', type: 'line', data: this.graphData.map(d => d.pm25), color: this.SENSOR_COLORS.pm25, symbolSize: 3, lineStyle: { width: 1.8 } },
      ]
    };
  }
}