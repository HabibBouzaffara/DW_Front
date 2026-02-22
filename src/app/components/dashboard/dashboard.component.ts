import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { StatisticsService } from 'src/app/services/dim-customer.service';
import { AuthService } from 'src/app/services/auth.service';
import { TimeSeriesPointDto, TopProductDto } from 'src/app/models/models';
// FIXED IMPORT ← THIS WAS WRONG

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatisticsService);
  private authService = inject(AuthService);

  kpis: any[] = [];
  topProducts: TopProductDto[] = []; // ✅ Typed
  chartData: any[] = [];
  displayedColumns: string[] = ['product', 'sales']; // ✅ For mat-table

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    // ✅ Now WORKS - correct service + types
    this.statsService.getTopProducts(5, 'desc').subscribe((data) => {
      this.topProducts = data;
    });

    this.statsService
      .getTimeSeries('sales', 'month', 12)
      .subscribe((data: TimeSeriesPointDto[]) => {
        this.chartData = [
          {
            name: 'Sales',
            series: data.map((p) => ({ name: p.period, value: p.totalAmount })),
          },
        ];
      });
  }
}
