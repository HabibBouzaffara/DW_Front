import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private baseUrl = 'https://localhost:7280/api';

  constructor(private http: HttpClient) {}

  /* ===============================
     DIMENSIONS
  ================================ */

  getCustomers(page = 1, pageSize = 10): Observable<PagedResult<any>> {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/DimCustomer?page=${page}&pageSize=${pageSize}`,
    );
  }

  getProducts(page = 1, pageSize = 10) {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/DimProduct?page=${page}&pageSize=${pageSize}`,
    );
  }

  getDates(page = 1, pageSize = 10) {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/DimDate?page=${page}&pageSize=${pageSize}`,
    );
  }

  /* ===============================
     FACTS
  ================================ */

  getFactSales(page = 1, pageSize = 10) {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/FactSale?page=${page}&pageSize=${pageSize}`,
    );
  }

  getFactPurchasing(page = 1, pageSize = 10) {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/FactPurchasing?page=${page}&pageSize=${pageSize}`,
    );
  }

  /* ===============================
     STATISTICS
  ================================ */

  getSalesByVendor(
    top: number = 10,
    sort: string = 'desc',
    category: string = 'all',
  ) {
    return this.http.get<any[]>(
      `${this.baseUrl}/statistics/sales-by-vendor?sort=${sort}&top=${top}&category=${category}`,
    );
  }

  getTopProducts(top = 10, sort = 'desc') {
    return this.http.get<any[]>(
      `${this.baseUrl}/statistics/top-products?top=${top}&sort=${sort}`,
    );
  }

  getTimeSeries(metric: string, period: string, months = 12) {
    return this.http.get<any[]>(
      `${this.baseUrl}/statistics/time-series?metric=${metric}&period=${period}&months=${months}`,
    );
  }
  getCategories() {
    return this.http.get<string[]>(`${this.baseUrl}/DimProduct/categories`);
  }
}
