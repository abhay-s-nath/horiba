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
  private deviceService = inject(DeviceService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  devices: DeviceData[] = [];
  lastUpdated: string = '';
  private dataSubscription?: Subscription;

  ngOnInit() {
    this.loadData();
    
    this.dataSubscription = interval(30000).subscribe(() => this.loadData());
  }

  loadData() {
    this.deviceService.getLiveData().subscribe({
      next: (response: LiveDataResponse) => {
        if (response && response.deviceData) {
          this.devices = response.deviceData;
          this.lastUpdated = response.dateTime;
          
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('API Error:', err)
    });
  }

  goToDeviceDetail(device: DeviceData) {
    this.router.navigate(['/device-detail', device.deviceId]);
  }

  ngOnDestroy() {
    // Prevent memory leaks when navigating away from this component
    this.dataSubscription?.unsubscribe();
  }
}