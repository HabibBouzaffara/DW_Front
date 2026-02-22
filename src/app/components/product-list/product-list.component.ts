import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  /** Full list as returned by the API — never mutated after load */
  allProducts: Product[] = [];

  categories: string[] = ['all'];
  selectedCategory = 'all';
  searchTerm = '';

  page = 1;
  pageSize = 12;
  loading = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  /** Fetch everything once; extract categories from the real data */
  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (res: any) => {
        // Support both plain array and paged { items } response
        this.allProducts = Array.isArray(res)
          ? res
          : (res?.items ?? []);

        // Build category list dynamically from actual data
        const cats = [
          ...new Set(
            this.allProducts
              .map((p) => p.category)
              .filter((c) => !!c)
          ),
        ].sort();
        this.categories = ['all', ...cats];

        this.loading = false;
      },
      error: () => {
        this.allProducts = [];
        this.loading = false;
      },
    });
  }

  // ── Client-side filtering (category + search) ──────────────────

  get filteredProducts(): Product[] {
    let list = this.allProducts ?? [];

    // 1. Category filter
    if (this.selectedCategory !== 'all') {
      list = list.filter(
        (p) => p.category === this.selectedCategory
      );
    }

    // 2. Search filter
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((p) =>
        p.productName?.toLowerCase().includes(term)
      );
    }

    return list;
  }

  // ── Pagination applied on top of filtered results ──────────────

  get pagedProducts(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalCount(): number {
    return this.filteredProducts.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }

  onCategoryChange(): void {
    this.page = 1; // reset to first page on filter change
  }

  onSearchChange(): void {
    this.page = 1; // reset to first page on search change
  }

  prevPage(): void {
    if (this.page > 1) this.page--;
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.page++;
  }
}
