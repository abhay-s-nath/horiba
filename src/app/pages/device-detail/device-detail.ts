import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { isDevMode } from '@angular/core';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './device-detail.html',
  styleUrls: ['./device-detail.css']
})
export class DeviceDetailComponent implements OnInit {
  public device: any = null;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const stateData = navigation?.extras.state?.['data'];

    if (stateData) {
      this.device = stateData;
    }
  }

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id && !this.device) {
      if (isDevMode()) {
        console.error('Device ID is null and no state data found. Redirecting...');
      }
      this.router.navigate(['/devices']);
      return;
    }

  }

  public goBack(): void {
    this.router.navigate(['/devices']);
  }
}