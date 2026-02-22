import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css'],
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  loading = false;
  searchTerm = '';
  selectedCategory = 'all';

  // Modal state
  showModal = false;
  isEditMode = false;
  saving = false;
  deleteConfirmId: number | null = null;

  formData: Partial<Product> = this.emptyForm();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (res: any) => {
        this.products = Array.isArray(res) ? res : (res?.items ?? []);
        this.categories = [
          ...new Set(this.products.map((p) => p.category).filter(Boolean)),
        ].sort() as string[];
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      },
    });
  }

  // ── Filtering ────────────────────────────────────────────
  get filteredProducts(): Product[] {
    let list = this.products;
    if (this.selectedCategory !== 'all') {
      list = list.filter((p) => p.category === this.selectedCategory);
    }
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((p) =>
        p.productName?.toLowerCase().includes(term)
      );
    }
    return list;
  }

  // ── Create ───────────────────────────────────────────────
  openCreate(): void {
    this.isEditMode = false;
    this.formData = this.emptyForm();
    this.showModal = true;
  }

  // ── Edit ─────────────────────────────────────────────────
  openEdit(product: Product): void {
    this.isEditMode = true;
    this.formData = { ...product };
    this.showModal = true;
  }

  // ── Save (create or update) ───────────────────────────────
  save(form: NgForm): void {
    if (form.invalid) return;
    this.saving = true;

    const request$ = this.isEditMode
      ? this.productService.update(this.formData.id!, this.formData)
      : this.productService.create(this.formData);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.loadProducts();
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  // ── Delete ────────────────────────────────────────────────
  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteProduct(): void {
    if (this.deleteConfirmId === null) return;
    this.productService.delete(this.deleteConfirmId).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.loadProducts();
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  private emptyForm(): Partial<Product> {
    return {
      productName: '',
      listPrice: 0,
      standardCost: 0,
      category: '',
      subcategory: '',
      image: '',
    };
  }
}
