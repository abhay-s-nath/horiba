import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DAY_DATA, WEEK_DATA, MONTH_DATA } from '../dummy-data/analytics';

@Injectable({
  providedIn: 'root'
})
export class LiveDataService {

  private baseUrl = 'http://localhost:5000/aaqms';
  private useDummyData = true;

  constructor(private http: HttpClient) {}

  getLiveData(): Observable<any> {
    // return this.http.get(`${this.baseUrl}/getLiveData`);
    const dummyRes = {
      deviceData: [
        { 
          deviceId: 1, 
          deviceStatusId: 1,  // active
          alarmData: [], 
          analyzerData: { temp: 24.5, humidity: 48 } 
        },
        { 
          deviceId: 2, 
          deviceStatusId: 1,  // active
          alarmData: [{ id: 101 }], 
          analyzerData: { temp: 26.3, humidity: 52 } 
        },
        { 
          deviceId: 3, 
          deviceStatusId: 2,  // inactive
          alarmData: [], 
          analyzerData: { temp: 22.0, humidity: 45 } 
        },
        { 
          deviceId: 4, 
          deviceStatusId: 3,  // maintenance
          alarmData: [{ id: 102 }], 
          analyzerData: { temp: 28.1, humidity: 55 } 
        },
        { 
          deviceId: 5, 
          deviceStatusId: 1,  // active
          alarmData: [], 
          analyzerData: { temp: 25.7, humidity: 50 } 
        },
        { 
          deviceId: 6, 
          deviceStatusId: 4,  // disconnected
          alarmData: [{ id: 103 }], 
          analyzerData: { temp: 27.5, humidity: 60 } 
        },
        { 
          deviceId: 7, 
          deviceStatusId: 1,  // active
          alarmData: [], 
          analyzerData: { temp: 23.8, humidity: 49 } 
        },
        { 
          deviceId: 8, 
          deviceStatusId: 2,  // inactive
          alarmData: [], 
          analyzerData: { temp: 24.2, humidity: 47 } 
        },
        { 
          deviceId: 9, 
          deviceStatusId: 1,  // active
          alarmData: [], 
          analyzerData: { temp: 25.0, humidity: 51 } 
        },
        { 
          deviceId: 10, 
          deviceStatusId: 3,  // maintenance
          alarmData: [{ id: 104 }], 
          analyzerData: { temp: 26.7, humidity: 53 } 
        },
        { 
          deviceId: 12, 
          deviceStatusId: 1, 
          alarmData: [], 
          analyzerData: { temp: 25.5, humidity: 50 } 
        },
        { 
          deviceId: 15, 
          deviceStatusId: 1, 
          alarmData: [], 
          analyzerData: { temp: 24.9, humidity: 49 } 
        }
      ]
    };
    return of(dummyRes)
    }
  getLoggedData(startDate: string, endDate: string, interval: number): Observable<any> {
    if (this.useDummyData) {
      let dataToReturn: { graph: any[], table: any[] };

      // Determine which data set to return based on the interval
      if (interval <= 3600) { // Hourly (Day or Week view)
        // If the date range is 1 day, use DAY_DATA
        const diffInDays = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24);
        if (diffInDays < 2) {
             dataToReturn = DAY_DATA;
        } else {
             dataToReturn = WEEK_DATA;
        }
      } else { // Daily (Month view, interval > 3600, e.g., 3600*24)
        dataToReturn = MONTH_DATA;
      }
      
      // The component expects the graph and table data separately, 
      // but the service currently returns a raw time-series array string.
      // To match the EXPECTED logic in your dashboard.ts, 
      // we need to return the 'graph' part as the time-series array.
      
      // IMPORTANT: Your dashboard.ts expects the raw data, NOT the pre-processed graph/table structure.
      // Since your dummy data is already processed into {graph, table}, 
      // you must return the 'graph' array and modify the dashboard.ts logic to use it.
      
      // Let's assume the component consuming this service expects the 'graph' data structure.
      // If your dashboard.ts still expects a TIME-SERIES array, you will need to adjust the structure.
      
      // **Simulating the raw time-series array response (to fit your existing dashboard logic):**
      // The DAY_DATA.graph structure works as a time-series array substitute.
      return of(JSON.stringify(dataToReturn.graph));
      
      // **Alternative (Simpler) Approach: Return the pre-processed object**
      // return of(JSON.stringify(dataToReturn));
      // NOTE: This would require you to change how you parse the data in dashboard.ts.

    } else {
      // Original logic for live data
      const url = `${this.baseUrl}/getLoggedData/${startDate}/${endDate}/${interval}`;
      return this.http.get(url, { responseType: 'text' });
    }
  }


}
