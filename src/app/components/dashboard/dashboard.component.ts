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

  categories: string[] = [
    'all',
    'clothing',
    'Bikes',
    'Components',
    'Unknown',
    'Accessories',
  ];

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

  kpis = {
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
  };

  profitChartData: any = {
    labels: [],
    datasets: [
      {
        label: 'Profit By Product',
        data: [],
        backgroundColor: 'rgba(76,175,80,0.6)',
      },
    ],
  };

  profitChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };
  topProfit: number = 10;
  sortProfit: string = 'desc';

  comparisonChartData: any = {
    labels: [],
    datasets: [
      {
        label: 'Total Sales',
        data: [],
        backgroundColor: 'rgba(33,150,243,0.6)',
      },
      {
        label: 'Total Purchase',
        data: [],
        backgroundColor: 'rgba(244,67,54,0.6)',
      },
    ],
  };

  comparisonChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };
  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadVendorData();
    this.loadKpis();
    // this.loadTopProducts();
    this.loadProductsByProfit();
  }
  loadKpis() {
    this.dashboardService.getKpis().subscribe((data) => {
      console.log('KPI DATA:', data);

      this.kpis.totalSales = data.totalSalesAmount;
      this.kpis.totalCustomers = data.totalCustomers;
      this.kpis.totalProducts = data.totalProducts;
    });
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
  loadProductsByProfit() {
    this.dashboardService
      .getProductsByProfit(this.topProfit, this.sortProfit)
      .subscribe((data) => {
        console.log('Profit Data:', data);

        // 🔹 PROFIT CHART
        this.profitChartData.labels = data.map((x) => x.productName);

        this.profitChartData.datasets[0].data = data.map((x) =>
          Number(x.profit),
        );

        this.profitChartData = { ...this.profitChartData };

        // 🔹 SALES VS PURCHASE CHART
        this.comparisonChartData.labels = data.map((x) => x.productName);

        this.comparisonChartData.datasets[0].data = data.map((x) =>
          Number(x.totalSalesAmount),
        );

        this.comparisonChartData.datasets[1].data = data.map((x) =>
          Number(x.totalPurchaseAmount),
        );

        this.comparisonChartData = { ...this.comparisonChartData };
      });
  }
}
