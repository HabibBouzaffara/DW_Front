import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay, map } from 'rxjs/operators';
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

  // previously returned sales-by-vendor; backend now exposes purchasing-by-vendor
  // Keep this method as a thin wrapper/alias for compatibility with existing callers.
  getSalesByVendor(top = 10, order = 'desc', category: string | null = 'all') {
    return this.getPurchasingByVendor(top, order, category);
  }

  getTopProducts(top = 10, order = 'desc', category: string | null = null) {
    // new endpoint returns revenue by product
    let url = `${this.baseUrl}/VwTopProduct?top=${top}&order=${order}`;
    if (category) {
      url += `&category=${category}`;
    }
    return this.getCached<any>(url).pipe(map((r: any) => (r && r.items) ? r.items : r));
  }

  getTimeSeries(metric: string, period: string, months = 12) {
    const url = `${this.baseUrl}/statistics/time-series?metric=${metric}&period=${period}&months=${months}`;
    return this.getCached<any[]>(url);
  }

  getProductsByProfit(top = 10, order = 'desc', category: string | null = null) {
    let url = `${this.baseUrl}/VwProductProfit?top=${top}&order=${order}`;
    if (category) {
      url += `&category=${category}`;
    }
    return this.getCached<any>(url).pipe(map((r: any) => (r && r.items) ? r.items : r));
  }

  getKpis() {
    // KPI endpoint remains unchanged for now; backend modifications did not include this
    const url = `${this.baseUrl}/Kpi/getKpis`;
    return this.getCached<any>(url);
  }

  /* new backend endpoints, exposed directly from the API */
  getPurchasingByVendor(top = 50, order = 'desc', category: string | null = null) {
    let url = `${this.baseUrl}/VwPurchasingByVendor?top=${top}&order=${order}`;
    if (category !== null && category !== undefined) {
      url += `&category=${category}`;
    }
    return this.getCached<any>(url).pipe(map((r: any) => (r && r.items) ? r.items : r));
  }

  getSalesByTerritory(top = 50, order = 'desc', territory: string | null = null) {
    let url = `${this.baseUrl}/VwSalesByTerritory?top=${top}&order=${order}`;
    if (territory !== null && territory !== undefined) {
      url += `&territory=${territory}`;
    }
    return this.getCached<any>(url).pipe(map((r: any) => (r && r.items) ? r.items : r));
  }

  getSalesByYear(top = 50, order = 'desc') {
    const url = `${this.baseUrl}/VwTotalSalesByYear?top=${top}&order=${order}`;
    return this.getCached<any>(url).pipe(map((r: any) => (r && r.items) ? r.items : r));
  }

  // optional detailed endpoints might be used later
  getPurchasingBase(top = 50, order = 'desc', category: string | null = null) {
    let url = `${this.baseUrl}/VwPurchasingBase?top=${top}&order=${order}`;
    if (category !== null && category !== undefined) {
      url += `&category=${category}`;
    }
    return this.getCached<any>(url).pipe(map((r: any) => (r && r.items) ? r.items : r));
  }

  getSalesBase(top = 50, order = 'desc', category: string | null = null) {
    let url = `${this.baseUrl}/VwSalesBase?top=${top}&order=${order}`;
    if (category !== null && category !== undefined) {
      url += `&category=${category}`;
    }
    return this.getCached<any>(url).pipe(map((r: any) => (r && r.items) ? r.items : r));
  }

  /* ─────────────────────────────────────────────
     PARALLEL INITIAL LOAD helper
     Fetches KPIs + vendor data + profit data in
     ONE round-trip batch; resolves when ALL done.
  ───────────────────────────────────────────── */

  loadInitialStats(
    topVendor = 10,
    orderVendor = 'desc',
    categoryVendor = 'all',
    topProfit = 10,
    orderProfit = 'desc'
  ): Observable<[any, any[], any[]]> {
    // fetch KPI + vendor purchasing + product profit in one batch
    return forkJoin([
      this.getKpis(),
      this.getPurchasingByVendor(topVendor, orderVendor, categoryVendor),
      this.getProductsByProfit(topProfit, orderProfit, categoryVendor),
    ]);
  }
}
