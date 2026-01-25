import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiTile } from '../../shared/components/kpi-tile/kpi-tile';
import { GaugeChartComponent } from '../../shared/components/gauge-chart/gauge-chart';
import { AnalyticsGraph } from '../../shared/components/analytics-graph/analytics-graph';
import { LiveDataService } from '../../services/live-data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiTile,
    GaugeChartComponent,
    AnalyticsGraph,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  // KPI State
  kpis: any[] = [];
  kpisLoading = true;

  // Graph and Table State
  dayGraph: any[] = [];
  dayTable: any[] = [];
  weekGraph: any[] = [];
  weekTable: any[] = [];
  monthGraph: any[] = [];
  monthTable: any[] = [];

  private cdr = inject(ChangeDetectorRef);

  constructor(private liveDataService: LiveDataService) { }

  ngOnInit(): void {
    this.initDashboard();
  }

  /**
   * Initializes the dashboard with current date ranges
   */
  private initDashboard(): void {
    this.loadKPIs();
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
  
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
    // Initial data fetch
    this.loadGraphData('day', formatDate(yesterday), formatDate(today));
    this.loadGraphData('week', formatDate(lastWeek), formatDate(today));
    this.loadGraphData('month', '2025-12-01', formatDate(today));
  }

  /**
   * Fetches and calculates KPI metrics from live device data
   */
  loadKPIs(): void {
    this.kpisLoading = true;
    this.liveDataService.getLiveData().subscribe({
      next: (res) => {
        const devices = res.deviceData || [];
        const totalDevices = devices.length;
        const airDevices = devices.filter((d: any) => d.deviceType === 'AAQMS Device');
        const waterDevices = devices.filter((d: any) => d.deviceType === 'WQMS Device');
        const connectedDevices = devices.filter((d: any) => d.deviceStatusId === 1).length;
        const disconnectedDevices = totalDevices - connectedDevices;
  
        let totalSensors = 0;
        let connectedSensors = 0; 
        
        devices.forEach((d: any) => {
          if (d.analyzerData) {
            totalSensors += d.analyzerData.length;
            connectedSensors += d.analyzerData.filter((a: any) => a.isValid === 1).length;
          }
        });
        
        const disconnectedSensors = totalSensors - connectedSensors;
  
        this.kpis = [
          { label: 'Total Devices', value: totalDevices, color: '#2371C7' },
          { label: 'Air Devices', value: airDevices.length, color: '#16a34a' },
          { label: 'Water Devices', value: waterDevices.length, color: '#0891b2' },
          { label: 'Connected Devices', value: connectedDevices, color: '#2563eb' },
          { label: 'Disconnected Devices', value: disconnectedDevices, color: '#dc2626' },
          { label: 'Total Sensors', value: totalSensors, color: '#2371C7' },
          { label: 'Connected Sensors', value: connectedSensors, color: '#16a34a' },
          { label: 'Disconnected Sensors', value: disconnectedSensors, color: '#dc2626' },
        ];

        this.kpisLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.kpisLoading = false;
        console.error('CRITICAL: KPI Data Load Failed', err);
        this.kpis = [{ label: 'Error', value: '--', color: 'gray' }];
      }
    });
  }

  /**
   * Fetches historical data and routes it to the correct graph state
   */
  loadGraphData(type: 'day' | 'week' | 'month', startDate: string, endDate: string): void {
    const interval = type === 'month' ? 86400 : 3600;
  
    this.liveDataService.getLoggedData(startDate, endDate, interval).subscribe({
      next: (res: any) => {
        let parsedData: any[] = [];

        // Determine if response is Array of Strings (CSV) or Raw String
        if (Array.isArray(res) && res.length > 0) {
          parsedData = this.parseCsvArray(res);
        } else if (typeof res === 'string' && res.trim() !== '') {
          const lines = res.split(/\r?\n/).filter(l => l.trim() !== '');
          parsedData = this.parseCsvArray(lines);
        }

        if (!parsedData || parsedData.length === 0) {
          console.warn(`⚠️ Dashboard [${type}]: Response received but no valid rows parsed.`);
          return;
        }

        // Production-level state update using fresh references
        const dataUpdate = [...parsedData];
        
        switch (type) {
          case 'day':
            this.dayGraph = dataUpdate;
            this.dayTable = dataUpdate;
            break;
          case 'week':
            this.weekGraph = dataUpdate;
            this.weekTable = dataUpdate;
            break;
          case 'month':
            this.monthGraph = dataUpdate;
            this.monthTable = dataUpdate;
            break;
        }

        console.log(`✅ Dashboard [${type}]: Successfully loaded ${parsedData.length} records.`);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(`❌ Dashboard [${type}]: Request failed`, err);
      }
    });
  }
  
  /**
   * Core Parser: Converts Array of CSV strings into JSON objects
   */
  private parseCsvArray(rows: string[]): any[] {
    if (!rows || rows.length < 2) return [];
  
    // Extract headers from index 0
    const headers = rows[0].split(',').map(h => h.trim());
  
    return rows.slice(1).map((row, rowIndex) => {
      const values = row.split(',');
      const obj: any = {};
      
      headers.forEach((header, index) => {
        const rawVal = values[index] ? values[index].trim() : '';
        
        // Logical conversion: Only columns that aren't Date/Time should be numbers
        if (header !== 'Date' && header !== 'Time' && rawVal !== '' && !isNaN(Number(rawVal))) {
          obj[header] = Number(rawVal);
        } else {
          obj[header] = rawVal || null;
        }
      });
  
      // Ensure name field exists for ECharts Axis (Map from backend 'Time')
      obj['name'] = obj['Time'] || `Point ${rowIndex}`;
      return obj;
    }).filter(item => item['Date'] !== null); // Clean up any trailing empty rows
  }

  /**
   * Filter trigger from UI datepicker
   */
  applyDateFilter(range: { start: string, end: string }, type: 'day' | 'week' | 'month'): void {
    if (range.start && range.end) {
      this.loadGraphData(type, range.start, range.end);
    }
  }
}