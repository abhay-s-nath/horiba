import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DeviceService } from '../../core/services/device'; 
import { DeviceData, LiveDataResponse } from '../../models/live-data.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [DatePipe], 
  templateUrl: './devices.html',
  styleUrls: ['./devices.css']
})
export class DevicesComponent implements OnInit, OnDestroy {
  // Use inject() for a cleaner, modern dependency injection style
  private deviceService = inject(DeviceService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  devices: DeviceData[] = [];
  lastUpdated: string = '';
  private dataSubscription?: Subscription;

  ngOnInit() {
    this.loadData();
    
    // Refresh data every 30 seconds
    this.dataSubscription = interval(30000).subscribe(() => this.loadData());
  }

  loadData() {
    this.deviceService.getLiveData().subscribe({
      next: (response: LiveDataResponse) => {
        console.log('API Response:', response);
        
        // Extract the deviceData array from the root object
        if (response && response.deviceData) {
          this.devices = response.deviceData;
          this.lastUpdated = response.dateTime;
          
          // Force Angular to update the UI with the 13 devices found in the console
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  goToDeviceDetail(device: DeviceData) {
    // Navigate using deviceId from your model
    this.router.navigate(['/device-detail', device.deviceId]);
  }

  ngOnDestroy() {
    // Prevent memory leaks when navigating away from this component
    this.dataSubscription?.unsubscribe();
  }
}