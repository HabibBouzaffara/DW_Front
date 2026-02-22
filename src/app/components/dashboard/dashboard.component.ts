import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { ChartConfiguration } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    NgChartsModule,
    CurrencyPipe,
    CommonModule,
    FormsModule,
  ],
})
export class DashboardComponent implements OnInit {
  salesData: any[] = [];
  topProducts: any[] = [];
  // ===== FILTERS =====
  topVendor: number = 10;
  sortVendor: string = 'desc';
  categoryVendor: string = 'all';

  categories: string[] = ['all','clothing', 'Bikes', 'Components', 'Unknown', 'Accessories'];

  /* ===== CHART CONFIG ===== */

  vendorChartData: any = {
    labels: [],
    datasets: [
      {
        label: 'Sales By Vendor',
        data: [],
        backgroundColor: 'rgba(63,81,181,0.6)',
      },
    ],
  };

  vendorChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadVendorData();
    // this.loadTopProducts();
  }

  loadVendorData() {
    this.dashboardService
      .getSalesByVendor(this.topVendor, this.sortVendor, this.categoryVendor)
      .subscribe((data) => {
        console.log('Vendor Data:', data);

        // ✅ Correct Mapping
        this.vendorChartData.labels = data.map((x) => x.vendorName);

        this.vendorChartData.datasets[0].data = data.map(
          (x) => x.totalSalesAmount,
        );

        // ✅ Force Angular change detection
        this.vendorChartData = { ...this.vendorChartData };
      });
  }
  onVendorFilterChange() {
    this.loadVendorData();
  }
  loadTopProducts() {
    this.dashboardService.getTopProducts(5).subscribe((data) => {
      this.topProducts = data;
    });
  }
}
