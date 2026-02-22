import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

interface CacheEntry {
  data: any;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = 'https://localhost:7280/api';

  /** In-memory cache: url → { data, expiresAt } */
  private cache = new Map<string, CacheEntry>();

  constructor(private http: HttpClient) {}

  /* ─────────────────────────────────────────────
     CACHE HELPERS
  ───────────────────────────────────────────── */

  private getCached<T>(url: string): Observable<T> {
    const entry = this.cache.get(url);
    if (entry && Date.now() < entry.expiresAt) {
      return of(entry.data as T);            // cache hit → instant
    }
    return this.http.get<T>(url).pipe(
      tap((data) =>
        this.cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS })
      )
    );
  }

  /** Clear the full cache (e.g. on logout or forced refresh) */
  clearCache(): void {
    this.cache.clear();
  }

  /* ─────────────────────────────────────────────
     DIMENSIONS
  ───────────────────────────────────────────── */

  getCustomers(page = 1, pageSize = 10): Observable<PagedResult<any>> {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/DimCustomer?page=${page}&pageSize=${pageSize}`
    );
  }

  getProducts(page = 1, pageSize = 10) {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/DimProduct?page=${page}&pageSize=${pageSize}`
    );
  }

  getDates(page = 1, pageSize = 10) {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/DimDate?page=${page}&pageSize=${pageSize}`
    );
  }

  /* ─────────────────────────────────────────────
     FACTS
  ───────────────────────────────────────────── */

  getFactSales(page = 1, pageSize = 10) {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/FactSale?page=${page}&pageSize=${pageSize}`
    );
  }

  getFactPurchasing(page = 1, pageSize = 10) {
    return this.http.get<PagedResult<any>>(
      `${this.baseUrl}/FactPurchasing?page=${page}&pageSize=${pageSize}`
    );
  }

  /* ─────────────────────────────────────────────
     STATISTICS  (all cached)
  ───────────────────────────────────────────── */

  getSalesByVendor(top = 10, sort = 'desc', category = 'all') {
    const url = `${this.baseUrl}/statistics/sales-by-vendor?sort=${sort}&top=${top}&category=${category}`;
    return this.getCached<any[]>(url);
  }

  getTopProducts(top = 10, sort = 'desc') {
    const url = `${this.baseUrl}/statistics/top-products?top=${top}&sort=${sort}`;
    return this.getCached<any[]>(url);
  }

  getTimeSeries(metric: string, period: string, months = 12) {
    const url = `${this.baseUrl}/statistics/time-series?metric=${metric}&period=${period}&months=${months}`;
    return this.getCached<any[]>(url);
  }

  getProductsByProfit(top = 10, sort = 'desc') {
    const url = `${this.baseUrl}/statistics/products-by-profit?top=${top}&sort=${sort}`;
    return this.getCached<any[]>(url);
  }

  getKpis() {
    const url = `${this.baseUrl}/statistics/totals`;
    return this.getCached<any>(url);
  }

  /* ─────────────────────────────────────────────
     PARALLEL INITIAL LOAD helper
     Fetches KPIs + vendor data + profit data in
     ONE round-trip batch; resolves when ALL done.
  ───────────────────────────────────────────── */

  loadInitialStats(
    topVendor = 10,
    sortVendor = 'desc',
    categoryVendor = 'all',
    topProfit = 10,
    sortProfit = 'desc'
  ): Observable<[any, any[], any[]]> {
    return forkJoin([
      this.getKpis(),
      this.getSalesByVendor(topVendor, sortVendor, categoryVendor),
      this.getProductsByProfit(topProfit, sortProfit),
    ]);
  }
}
