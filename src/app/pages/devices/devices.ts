import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { DeviceService } from '../../core/services/device'; 
import { DeviceData, LiveDataResponse } from '../../models/live-data.model';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './devices.html',
  styleUrls: ['./devices.css']
})
export class DevicesComponent implements OnInit, OnDestroy {
  private deviceService = inject(DeviceService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  public devices: DeviceData[] = [];
  public lastUpdated: string = '';
  public expandedDeviceId: any = null;
  public errorMessage: string | null = null; 
  public isLoading: boolean = true;          
  
  private dataSubscription?: Subscription;

  public ngOnInit(): void {
    this.loadData();
    this.dataSubscription = interval(30000).subscribe(() => this.loadData());
  }

  public toggleExpand(event: Event, deviceId: any): void {
    event.stopPropagation();
    this.expandedDeviceId = this.expandedDeviceId === deviceId ? null : deviceId;
  }

  public loadData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.deviceService.getLiveData().subscribe({
      next: (response: LiveDataResponse) => {
        this.isLoading = false;
        if (response && response.deviceData) {
          this.devices = response.deviceData;
          this.lastUpdated = response.dateTime;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load device data. Please try again later.'; 
        console.error('API Error:', err);
      }
    });
  }

  public goToDeviceDetail(device: any): void {
    this.router.navigate(['/device-detail', device.deviceId], { 
      state: { data: device } 
    });
  }

  public ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }
}