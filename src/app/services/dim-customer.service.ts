// dim-customer.service.ts (similar for DimProduct, etc.)
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import {
  PagedResult,
  DimCustomerDto,
  TimeSeriesPointDto,
  TopProductDto,
} from '../models/models';
import { environment } from '../environments/environment'; // Fixed path!
@Injectable({ providedIn: 'root' })
export class DimCustomerService {
  private base = '/api/DimCustomer';

  constructor(private http: HttpClient) {}

  getPaged(
    page: number,
    pageSize: number,
  ): Observable<PagedResult<DimCustomerDto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http
      .get<PagedResult<DimCustomerDto>>(this.base, { params })
      .pipe(
        retry(3),
        catchError((err) => {
          console.error(err);
          throw err;
        }),
      );
  }

  getById(id: number): Observable<DimCustomerDto> {
    return this.http.get<DimCustomerDto>(`${this.base}/${id}`).pipe(retry(2));
  }
}

// statistics.service.ts
@Injectable({ providedIn: 'root' })
export class StatisticsService {
  baseUrl: string = environment.apiBaseUrl; // Now using environment variable!
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
          throw err;
        }),
      );
  }
  constructor(private http: HttpClient) {}
  // ...
  getTimeSeries(
    metric: 'sales' | 'purchasing',
    period: string,
    months: number,
    category = 'all',
  ): Observable<TimeSeriesPointDto[]> {
    let params = new HttpParams()
      .set('metric', metric)
      .set('period', period)
      .set('months', months.toString())
      .set('category', category);
    return this.http
      .get<TimeSeriesPointDto[]>('/api/statistics/time-series', { params })
      .pipe(retry(2));
  }
}

// Usage: service.getPaged(1,10).subscribe(data => this.data = data); or | async in template
// RxJS: Use retry(3), catchError with user toasts. [web:1]
