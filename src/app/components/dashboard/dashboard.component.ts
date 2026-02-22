import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
  ],
})
export class DashboardComponent implements OnInit {
  constructor(private dashboardService: DashboardService) {}

  /* ========================= */
  /* LOADING SYSTEM            */
  /* ========================= */

  chartLoading = false;
  chartProgress = 0;

  private startLoadingAnimation() {
    this.chartLoading = true;
    this.chartProgress = 0;

    const interval = setInterval(() => {
      if (this.chartProgress < 90) {
        this.chartProgress += 10;
      } else {
        clearInterval(interval);
      }
    }, 100);
  }

  private stopLoadingAnimation() {
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

  topVendor: number = 10;
  sortVendor: string = 'desc';
  categoryVendor: string = 'all';

  topProfit: number = 10;
  sortProfit: string = 'desc';

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

  /* ========================= */
  /* INIT                      */
  /* ========================= */

  ngOnInit(): void {
    this.loadVendorData(true);
    this.loadKpis(true);
    this.loadProductsByProfit(true);
  }

  /* ========================= */
  /* KPI                       */
  /* ========================= */

  loadKpis(showLoading: boolean = false) {
    if (showLoading) {
      this.startLoadingAnimation();
    }

    this.dashboardService.getKpis().subscribe((data) => {
      this.kpis.totalSales = data.totalSalesAmount;
      this.kpis.totalCustomers = data.totalCustomers;
      this.kpis.totalProducts = data.totalProducts;

      if (showLoading) {
        this.stopLoadingAnimation();
      }
    });
  }

  /* ========================= */
  /* SALES BY VENDOR           */
  /* ========================= */

  loadVendorData(showLoading: boolean = true) {
    if (showLoading) {
      this.startLoadingAnimation();
    }

    this.dashboardService
      .getSalesByVendor(this.topVendor, this.sortVendor, this.categoryVendor)
      .subscribe((data) => {
        this.vendorChartData = {
          ...this.vendorChartData,
          labels: data.map((x) => x.vendorName),
          datasets: [
            {
              ...this.vendorChartData.datasets[0],
              data: data.map((x) => Number(x.totalSalesAmount)),
            },
          ],
        };

        if (showLoading) {
          this.stopLoadingAnimation();
        }
      });
  }

  onVendorFilterChange() {
    // 🔥 Silent reload — NO loading animation
    this.loadVendorData(false);
  }

  /* ========================= */
  /* PRODUCTS BY PROFIT        */
  /* ========================= */

  loadProductsByProfit(showLoading: boolean = false) {
    if (showLoading) {
      this.startLoadingAnimation();
    }

    this.dashboardService
      .getProductsByProfit(this.topProfit, this.sortProfit)
      .subscribe((data) => {
        this.profitChartData = {
          ...this.profitChartData,
          labels: data.map((x) => x.productName),
          datasets: [
            {
              ...this.profitChartData.datasets[0],
              data: data.map((x) => Number(x.profit)),
            },
          ],
        };

        this.comparisonChartData = {
          ...this.comparisonChartData,
          labels: data.map((x) => x.productName),
          datasets: [
            {
              ...this.comparisonChartData.datasets[0],
              data: data.map((x) => Number(x.totalSalesAmount)),
            },
            {
              ...this.comparisonChartData.datasets[1],
              data: data.map((x) => Number(x.totalPurchaseAmount)),
            },
          ],
        };

        if (showLoading) {
          this.stopLoadingAnimation();
        }
      });
  }
}
