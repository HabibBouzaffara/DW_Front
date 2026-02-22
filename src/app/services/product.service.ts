import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = 'https://localhost:7280/api/AuthProduct';

  constructor(private http: HttpClient) {}

  // GET /api/AuthProduct
  getAll(page = 1, pageSize = 12, category?: string): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    return this.http.get<PagedResult<Product>>(this.baseUrl, { params });
  }

  // GET /api/AuthProduct/{id}
  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  // GET /api/AuthProduct/categories
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  // POST /api/AuthProduct
  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  // PUT /api/AuthProduct/{id}
  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  // DELETE /api/AuthProduct/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
