import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import {
  TimeSeriesPointDto,
  TopProductDto,
  PurchasingByVendorDto,
} from '../models/models';
import { environment } from '../environments/environment'; // Fixed path!

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl; // Now using environment!

  getTopProducts(
    top: number,
    sort: 'asc' | 'desc',
  ): Observable<TopProductDto[]> {
    let params = new HttpParams().set('top', top.toString()).set('sort', sort);

    return this.http
      .get<
        TopProductDto[]
      >(`${this.baseUrl}/api/statistics/top-products`, { params })
      .pipe(
        retry(2),
        catchError((err) => {
          console.error('Stats error:', err);
          return throwError(() => err);
        }),
      );
  }

  getTimeSeries(
    metric: 'sales' | 'purchasing',
    period: 'day' | 'week' | 'month' | 'year',
    months: number,
    category = 'all',
  ): Observable<TimeSeriesPointDto[]> {
    let params = new HttpParams()
      .set('metric', metric)
      .set('period', period)
      .set('months', months.toString())
      .set('category', category);

    return this.http
      .get<
        TimeSeriesPointDto[]
      >(`${this.baseUrl}/api/statistics/time-series`, { params })
      .pipe(retry(2));
  }

  getPurchasingByVendor(
    sort: 'asc' | 'desc',
    category = 'all',
  ): Observable<PurchasingByVendorDto[]> {
    let params = new HttpParams().set('sort', sort).set('category', category);

    return this.http
      .get<
        PurchasingByVendorDto[]
      >(`${this.baseUrl}/api/statistics/purchasing-by-vendor`, { params })
      .pipe(retry(2));
  }
}
