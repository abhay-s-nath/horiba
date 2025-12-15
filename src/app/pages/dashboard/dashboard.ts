import { Component, OnInit } from '@angular/core';
import { KpiTile } from '../../shared/components/kpi-tile/kpi-tile';
import { GaugeChartComponent } from '../../shared/components/gauge-chart/gauge-chart';
import { AnalyticsGraph } from '../../shared/components/analytics-graph/analytics-graph';
import { GlobalFilters } from '../../shared/components/global-filters/global-filters';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { SummaryTable } from '../../shared/components/summary-table/summary-table';

import { LiveDataService } from '../../services/live-data.service';
// Import the dummy data constants directly to use the table data 
// (assuming you've implemented the dummy-logged-data.ts file)
import { DAY_DATA, WEEK_DATA, MONTH_DATA } from '../../dummy-data/analytics';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    KpiTile,
    GaugeChartComponent,
    AnalyticsGraph,
    CommonModule, // Already imported, moved up for clarity
    GlobalFilters,
    NgIf,
    NgFor,
    SummaryTable
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit { // Implement OnInit

  kpis: any[] = [];
  // Initialize as empty arrays, not just 'any'
  dayGraph: any[] = []; dayTable: any[] = []; 
  weekGraph: any[] = []; weekTable: any[] = []; 
  monthGraph: any[] = []; monthTable: any[] = [];

  constructor(private liveDataService: LiveDataService) { }

  ngOnInit() {
    this.loadKPIs(); 
    // Load initial data for the three graphs when the component initializes
    this.loadGraphData('day', '2025-01-01', '2025-01-02'); // Example day range
    this.loadGraphData('week', '2025-01-01', '2025-01-08'); // Example week range
    this.loadGraphData('month', '2025-01-01', '2025-01-31'); // Example month range
  }

  loadKPIs() {
    // This function only handles KPI data. The old getLoggedData call is removed from here.
    this.liveDataService.getLiveData().subscribe({
      next: (res) => {
        const devices = res.deviceData || [];

        const total = devices.length;
        const active = devices.filter((d: any) => d.deviceStatusId === 1).length;
        const alarm = devices.filter((d: any) => d.alarmData && d.alarmData.length > 0).length;
        const air = devices.filter((d: any) => d.deviceId >= 1 && d.deviceId <= 11).length;
        const water = devices.filter((d: any) => d.deviceId >= 12).length;

        this.kpis = [
          { label: 'Total Devices', value: total, color: '#2371C7' },
          { label: 'Air Devices', value: active, color: '#16a34a' },
          { label: 'Water Devices', value: water, color: '#0891b2' },
          { label: 'Connected Devices', value: air, color: '#2563eb' },
          { label: 'Total Sensors', value: total, color: '#2371C7' },
          { label: 'Connected Sensors', value: alarm, color: '#16a34a' },
          { label: 'Disconnected Sensors', value: alarm, color: '#dc2626' },
          { label: 'Disconnected Devices', value: alarm, color: '#dc2626' },
        ];
      },
      error: () => {
        this.kpis = [
          { label: 'Total Devices', value: '--', color: 'gray' }
        ];
      }
    });
  }

  // NEW FUNCTION: Fetches and processes data for a specific graph type
  loadGraphData(type: 'day' | 'week' | 'month', startDate: string, endDate: string) {
    let interval = 3600; // 1 hour for day/week
  
    if (type === 'month') {
        interval = 3600 * 24; // 1 day interval
    }
  
    this.liveDataService.getLoggedData(startDate, endDate, interval).subscribe({
      next: (res) => {
        try {
          // Step 1: Parse the string response. This is your graph data array.
          const graphArray = JSON.parse(res); 
          
          let tableArray: any[] = [];
          let targetGraph: any[] = [];
          let targetTable: any[] = [];
  
          // Step 2: Determine which set of dummy table data to use and assign to local variables
          if (type === 'day') {
            tableArray = DAY_DATA.table;
            targetGraph = this.dayGraph; 
            targetTable = this.dayTable;
          } else if (type === 'week') {
            tableArray = WEEK_DATA.table;
            targetGraph = this.weekGraph;
            targetTable = this.weekTable;
          } else if (type === 'month') {
            tableArray = MONTH_DATA.table;
            targetGraph = this.monthGraph;
            targetTable = this.monthTable;
          }
  
          // Step 3: Assign the data to the component properties to trigger graph and table updates
          // NOTE: We assign the parsed array directly to the graph property
          if (type === 'day') {
            this.dayGraph = graphArray;
            this.dayTable = tableArray;
          } else if (type === 'week') {
            this.weekGraph = graphArray;
            this.weekTable = tableArray;
          } else if (type === 'month') {
            this.monthGraph = graphArray;
            this.monthTable = tableArray;
          }
  
        } catch (e) {
          console.error(`Error parsing or assigning logged data for ${type}:`, e);
        }
      },
      error: (err) => console.error(`Logged Data Error for ${type}:`, err)
    });
  }
  
  // Handled by the EventEmitter from the analytics-graph component
  applyDateFilter(range: { start: string, end: string }, type: 'day' | 'week' | 'month') {
    console.log(`Applying filter for ${type}:`, range);
    // Reload the data for the specific graph type with the new date range
    this.loadGraphData(type, range.start, range.end);
  }
}