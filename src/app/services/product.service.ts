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
  getAll(page = 1, pageSize = 12, category?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    return this.http.get<any>(this.baseUrl, { params });
  }

  // GET /api/AuthProduct/{id}
  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  // GET /api/AuthProduct/categories
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  // POST /api/AuthProduct  — multipart/form-data
  create(data: Partial<Product>, imageFile?: File): Observable<Product> {
    const form = this.buildFormData(data, imageFile);
    return this.http.post<Product>(this.baseUrl, form);
  }

  // PUT /api/AuthProduct/{id}  — multipart/form-data
  update(id: number, data: Partial<Product>, imageFile?: File): Observable<Product> {
    const form = this.buildFormData(data, imageFile);
    return this.http.put<Product>(`${this.baseUrl}/${id}`, form);
  }

  // DELETE /api/AuthProduct/{id}
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ── Helper ──────────────────────────────────────────────────────────
  private buildFormData(data: Partial<Product>, imageFile?: File): FormData {
    const form = new FormData();

    if (data.productName  != null) form.append('productName',  String(data.productName));
    if (data.listPrice    != null) form.append('listPrice',    String(data.listPrice));
    if (data.standardCost != null) form.append('standardCost', String(data.standardCost));
    if (data.category     != null) form.append('category',     String(data.category));
    if (data.subcategory  != null) form.append('subcategory',  String(data.subcategory));

    // Raw file — backend converts to base64/stores
    if (imageFile) {
      form.append('image', imageFile, imageFile.name);
    }

    return form;
  }
}
