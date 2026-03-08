import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    MatCardModule,
    NgChartsModule,
    CurrencyPipe,
    CommonModule,
    FormsModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class DashboardComponent implements OnInit {
  constructor(private dashboardService: DashboardService) {}

  /* ========================= */
  /* LOADING SYSTEM            */
  /* ========================= */

  chartLoading = false;
  chartProgress = 0;
  private progressInterval: any;

  private startLoadingAnimation() {
    this.chartLoading = true;
    this.chartProgress = 0;
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (this.chartProgress < 90) {
        this.chartProgress += 10;
      } else {
        clearInterval(this.progressInterval);
      }
    }, 100);
  }

  private stopLoadingAnimation() {
    clearInterval(this.progressInterval);
    this.chartProgress = 100;
    setTimeout(() => {
      this.chartLoading = false;
    }, 300);
  }

  /* ========================= */
  /* KPI DATA                  */
  /* ========================= */

  kpis = {
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
  };

  /* ========================= */
  /* FILTERS                   */
  /* ========================= */

  globalTop: number = 10;
  globalSort: string = 'desc';
  globalCategory: string = 'clothing';

  errorMessage: string | null = null;

  hasVendorData = true;
  hasProfitData = true;
  hasTopProductsData = true;
  hasPurchasingData = true;
  hasTerritoryData = true;
  hasYearlyData = true;

  categories: string[] = [
    'all',
    'clothing',
    'Bikes',
    'Components',
    'Unknown',
    'Accessories',
  ];

  /* ========================= */
  /* CHARTS                    */
  /* ========================= */

  /* ========================= */
  /* CHARTS                    */
  /* ========================= */

  vendorChartData: any = {
    labels: [],
    datasets: [{ label: 'Purchasing By Vendor', data: [], backgroundColor: 'rgba(63,81,181,0.7)' }],
  };
  vendorChartOptions = { responsive: true, plugins: { legend: { display: true } } };

  profitChartData: any = {
    labels: [],
    datasets: [{ label: 'Profit By Product', data: [], backgroundColor: 'rgba(76,175,80,0.7)' }],
  };
  profitChartOptions = { responsive: true, plugins: { legend: { display: true } } };

  topProductsChartData: any = {
    labels: [],
    datasets: [{ label: 'Top Sold Products', data: [], backgroundColor: 'rgba(255,152,0,0.7)' }],
  };
  topProductsChartOptions = { responsive: true, plugins: { legend: { display: true } } };

  purchasingChartData: any = {
    labels: [],
    datasets: [{ label: 'Purchasing Amount', data: [], backgroundColor: ['rgba(233,30,99,0.7)', 'rgba(33,150,243,0.7)', 'rgba(156,39,176,0.7)', 'rgba(0,188,212,0.7)'] }],
  };
  purchasingChartOptions: any = { responsive: true, plugins: { legend: { position: 'right' as const } } };

  territoryChartData: any = {
    labels: [],
    datasets: [{ label: 'Sales By Territory', data: [], backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0'] }],
  };
  territoryChartOptions: any = { responsive: true, plugins: { legend: { position: 'right' as const } } };

  yearlyChartData: any = {
    labels: [],
    datasets: [{ label: 'Sales By Year', data: [], backgroundColor: 'rgba(103,58,183,0.7)', borderColor: 'rgba(103,58,183,1)', fill: true }],
  };
  yearlyChartOptions = { responsive: true, plugins: { legend: { display: true } } };

  ngOnInit(): void {
    this.loadAllData(true);
  }

  /* ========================= */
  /* PAGINATION STATE          */
  /* ========================= */

  fullPurchasingData: any[] = [];
  purchasingPage = 0;
  purchasingPageSize = 5;

  fullTerritoryData: any[] = [];
  territoryPage = 0;
  territoryPageSize = 5;

  nextPurchasingPage() {
    if ((this.purchasingPage + 1) * this.purchasingPageSize < this.fullPurchasingData.length) {
      this.purchasingPage++;
      this.updatePurchasingChart();
    }
  }

  prevPurchasingPage() {
    if (this.purchasingPage > 0) {
      this.purchasingPage--;
      this.updatePurchasingChart();
    }
  }

  nextTerritoryPage() {
    if ((this.territoryPage + 1) * this.territoryPageSize < this.fullTerritoryData.length) {
      this.territoryPage++;
      this.updateTerritoryChart();
    }
  }

  prevTerritoryPage() {
    if (this.territoryPage > 0) {
      this.territoryPage--;
      this.updateTerritoryChart();
    }
  }

  /* ========================= */
  /* APPLY HELPERS             */
  /* ========================= */

  private applyKpis(data: any) {
    if (!data) return;
    this.kpis.totalSales = data.totalSales || 0;
    this.kpis.totalCustomers = data.totalCustomers || 0;
    this.kpis.totalProducts = data.totalProducts || 0;
  }

  private applyVendorData(data: any[]) {
    this.hasVendorData = data && data.length > 0;
    if (!this.hasVendorData) return;
    this.vendorChartData = {
      ...this.vendorChartData,
      labels: data.map((x) => x.vendorName || 'Unknown'),
      // backend now returns TotalPurchasing instead of totalSalesAmount
      datasets: [{ ...this.vendorChartData.datasets[0], data: data.map((x) => Number(x.totalPurchasing || 0)) }],
    };
  }

  private applyProfitData(data: any[]) {
    this.hasProfitData = data && data.length > 0;
    if (!this.hasProfitData) return;
    this.profitChartData = {
      ...this.profitChartData,
      labels: data.map((x) => x.productName || 'Unknown'),
      datasets: [{ ...this.profitChartData.datasets[0], data: data.map((x) => Number(x.profit || 0)) }],
    };
  }

  private applyTopProducts(data: any[]) {
    this.hasTopProductsData = data && data.length > 0;
    if (!this.hasTopProductsData) return;
    this.topProductsChartData = {
      ...this.topProductsChartData,
      labels: data.map((x) => x.productName || x.productName || 'Unknown'),
      // new endpoint returns Revenue field
      datasets: [{ ...this.topProductsChartData.datasets[0], data: data.map((x) => Number(x.revenue || 0)) }],
    };
  }

  private applyPurchasingData(data: any[]) {
    this.hasPurchasingData = data && data.length > 0;
    if (!this.hasPurchasingData) return;
    this.fullPurchasingData = data;
    this.purchasingPage = 0;
    this.updatePurchasingChart();
  }

  private updatePurchasingChart() {
    const start = this.purchasingPage * this.purchasingPageSize;
    const end = start + this.purchasingPageSize;
    const pageData = this.fullPurchasingData.slice(start, end);
    this.purchasingChartData = {
      ...this.purchasingChartData,
      labels: pageData.map((x) => x.vendorName || 'Unknown'),
      // table/chart entry uses TotalPurchasing under new contract
      datasets: [{ ...this.purchasingChartData.datasets[0], data: pageData.map((x) => Number(x.totalPurchasing || 0)) }],
    };
  }

  private applyTerritoryData(data: any[]) {
    this.hasTerritoryData = data && data.length > 0;
    if (!this.hasTerritoryData) return;
    this.fullTerritoryData = data;
    this.territoryPage = 0;
    this.updateTerritoryChart();
  }

  private updateTerritoryChart() {
    const start = this.territoryPage * this.territoryPageSize;
    const end = start + this.territoryPageSize;
    const pageData = this.fullTerritoryData.slice(start, end);
    this.territoryChartData = {
      ...this.territoryChartData,
      labels: pageData.map((x) => x.territoryName || 'Unknown'),
      // backend uses TotalSales
      datasets: [{ ...this.territoryChartData.datasets[0], data: pageData.map((x) => Number(x.totalSales || 0)) }],
    };
  }

  private applyYearlyData(data: any[]) {
    this.hasYearlyData = data && data.length > 0;
    if (!this.hasYearlyData) return;
    this.yearlyChartData = {
      ...this.yearlyChartData,
      labels: data.map((x) => x.yearNumber || x.YearNumber || 'Unknown'),
      datasets: [{ ...this.yearlyChartData.datasets[0], data: data.map((x) => Number(x.totalSales || 0)) }],
    };
  }

  loadAllData(showLoading = true) {
    if (showLoading) this.startLoadingAnimation();
    this.errorMessage = null;

    let completed = 0;
    const total = 7;
    let hasError = false;

    const checkComplete = () => {
      completed++;
      if (completed === total) {
        if (showLoading) this.stopLoadingAnimation();
        if (hasError) {
          this.errorMessage = "Some statistics failed to load, displaying partial dashboard.";
        }
      }
    };

    const handleError = (err: any) => {
      console.error(err);
      hasError = true;
      checkComplete();
    };

    this.dashboardService.getKpis().subscribe({
      next: (data) => { this.applyKpis(data); checkComplete(); },
      error: handleError
    });

    // vendor chart now powered by purchasing endpoint
    this.dashboardService.getPurchasingByVendor(this.globalTop, this.globalSort, this.globalCategory).subscribe({
      next: (data) => { console.log(data); this.applyVendorData(data); checkComplete(); },
      error: handleError
    });

    this.dashboardService.getProductsByProfit(this.globalTop, this.globalSort, this.globalCategory).subscribe({
      next: (data) => { this.applyProfitData(data); checkComplete(); },
      error: handleError
    });

    this.dashboardService.getTopProducts(this.globalTop, this.globalSort, this.globalCategory).subscribe({
      next: (data) => { this.applyTopProducts(data); checkComplete(); },
      error: handleError
    });

    // table uses the same purchasing-by-vendor dataset
    this.dashboardService.getPurchasingByVendor(this.globalTop, this.globalSort, this.globalCategory).subscribe({
      next: (data) => { this.applyPurchasingData(data); checkComplete(); },
      error: handleError
    });

    this.dashboardService.getSalesByTerritory(this.globalTop, this.globalSort).subscribe({
      next: (data) => { this.applyTerritoryData(data); checkComplete(); },
      error: handleError
    });

    this.dashboardService.getSalesByYear(this.globalTop, this.globalSort).subscribe({
      next: (data) => { this.applyYearlyData(data); checkComplete(); },
      error: handleError
    });
  }

  onFilterChange() {
    this.loadAllData(false);
  }

}
