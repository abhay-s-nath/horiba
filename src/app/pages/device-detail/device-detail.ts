import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './device-detail.html',
  styleUrls: ['./device-detail.css']
})
export class DeviceDetailComponent implements OnInit {
  device: any = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['data']) {
      this.device = navigation.extras.state['data'];
    }
  }

  ngOnInit() {
    // console.log('Live API Device Data:', this.device);
  }

  goBack() {
    this.router.navigate(['//devices']);
  }
}