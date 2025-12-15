import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Device } from '../../models/device.model';
import { DEVICES } from '../../dummy-data/devices';

@Injectable({ providedIn: 'root' })
export class DeviceService {

  getAllDevices() {
    return of(DEVICES);
  }

  getDeviceById(id: string) {
    return of(DEVICES.find(d => d.id === id));
  }

  toggleDeviceStatus(id: string) {
    DEVICES.forEach(d => {
      if (d.id === id) {
        d.status = d.status === "connected" ? "disconnected" : "connected";
      }
    });
    return of(true);
  }
}
