import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DEVICES } from '../../dummy-data/devices';  // Your devices data
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-devices',
  templateUrl: './devices.html',
  imports:[CommonModule],
  styleUrls: ['./devices.css']
})
export class DevicesComponent implements OnInit {

  devices = DEVICES; // Use the dummy data for now

  constructor(private router: Router) {}

  ngOnInit() {}

  goToDeviceDetail(device: any) {
    // Navigate to the device detail page
    this.router.navigate(['/device-detail', device.id]);  // Use device ID to route
  }
}
