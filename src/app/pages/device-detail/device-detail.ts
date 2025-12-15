import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { DEVICES } from '../../dummy-data/devices';  // Your devices data

@Component({
  selector: 'app-device-detail',
  templateUrl: './device-detail.html',
  imports:[CommonModule],
  styleUrls: ['./device-detail.css']
})
export class DeviceDetailComponent implements OnInit {

  device: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const deviceId = this.route.snapshot.paramMap.get('id');  // Get device ID from route
    this.device = DEVICES.find(dev => dev.id === deviceId);  // Find the device by ID
  }
}
