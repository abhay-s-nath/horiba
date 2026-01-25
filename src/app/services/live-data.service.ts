import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LiveDataResponse } from '../models/live-data.model';

@Injectable({
  providedIn: 'root'
})
export class LiveDataService {

  private baseUrl = 'http://localhost:5000/aaqms';

  constructor(private http: HttpClient) {}

  /**
   * Fetches real-time live data
   */
  getLiveData(): Observable<LiveDataResponse> {
    return this.http.get<LiveDataResponse>(`${this.baseUrl}/getLiveData`);
  }

  /**
   * Fetches historical logged data
   * UPDATED: Removed responseType: 'text' to allow Angular to parse the JSON array automatically.
   */
  getLoggedData(startDate: string, endDate: string, intervalSeconds: number): Observable<any[]> {
    const url = `${this.baseUrl}/getLoggedData/${startDate}/${endDate}/${intervalSeconds}`;
    
    // The backend returns ["row1", "row2"], which is valid JSON.
    // By not specifying 'text', Angular handles the parsing for us.
    return this.http.get<any[]>(url);
  }
}