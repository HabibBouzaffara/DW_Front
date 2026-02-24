import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  /** Full list returned by the API */
  allProducts: Product[] = [];

  categories: string[] = ['all'];
  selectedCategory = 'all';
  searchTerm = '';

  page = 1;
  pageSize = 12;
  loading = false;

  // ── Admin CRUD state ──────────────────────────────────────
  showModal = false;
  isEditMode = false;
  saving = false;
  deleteConfirmId: number | null = null;
  formData: Partial<Product> = this.emptyForm();

  /** The raw File chosen by the admin for upload */
  imageFile: File | null = null;
  /** Object URL used for the in-modal preview */
  imagePreviewUrl: string | null = null;

  constructor(
    private productService: ProductService,
    public authService: AuthService,
    public cartService: CartService
  ) {}

  get isAdmin(): boolean {
    return this.authService.getUserRole() === '1';
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  // ── Data loading ──────────────────────────────────────────

  loadProducts(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (res: any) => {
        this.allProducts = Array.isArray(res) ? res : (res?.items ?? []);

        // Derive categories from real data
        const cats = [
          ...new Set(
            this.allProducts.map((p) => p.category).filter(Boolean)
          ),
        ].sort() as string[];
        this.categories = ['all', ...cats];

        this.loading = false;
      },
      error: () => {
        this.allProducts = [];
        this.loading = false;
      },
    });
  }

  // ── Client-side filtering ─────────────────────────────────

  get filteredProducts(): Product[] {
    let list = this.allProducts ?? [];
    if (this.selectedCategory !== 'all') {
      list = list.filter((p) => p.category === this.selectedCategory);
    }
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((p) => p.productName?.toLowerCase().includes(term));
    }
    return list;
  }

  get pagedProducts(): Product[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalCount(): number { return this.filteredProducts.length; }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / this.pageSize)); }

  onCategoryChange(): void { this.page = 1; }
  onSearchChange(): void   { this.page = 1; }
  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }

  // ── Admin: Create ─────────────────────────────────────────

  openCreate(): void {
    this.isEditMode = false;
    this.formData = this.emptyForm();
    this.imageFile = null;
    this.imagePreviewUrl = null;
    this.showModal = true;
  }

  // ── Admin: Edit ───────────────────────────────────────────

  openEdit(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isEditMode = true;
    this.formData = { ...product };
    this.imageFile = null;
    // Show existing image as preview (base64 from backend)
    this.imagePreviewUrl = product.image || null;
    this.showModal = true;
  }

  // ── Admin: File selection ─────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imageFile = file;
    // Free old preview URL if any
    if (this.imagePreviewUrl && this.imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
    this.imagePreviewUrl = URL.createObjectURL(file);
  }

  // ── Admin: Save ───────────────────────────────────────────

  save(form: NgForm): void {
    if (form.invalid) return;
    this.saving = true;

    const req$ = this.isEditMode
      ? this.productService.update(this.formData.id!, this.formData, this.imageFile ?? undefined)
      : this.productService.create(this.formData, this.imageFile ?? undefined);

    req$.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadProducts();
      },
      error: () => { this.saving = false; },
    });
  }

  closeModal(): void {
    if (this.imagePreviewUrl && this.imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
    this.imagePreviewUrl = null;
    this.imageFile = null;
    this.showModal = false;
  }

  // ── Admin: Delete ─────────────────────────────────────────

  confirmDelete(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.deleteConfirmId = id;
  }

  cancelDelete(): void { this.deleteConfirmId = null; }

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
    return { productName: '', listPrice: 0, standardCost: 0, category: '', subcategory: '', image: '' };
  }

  // ── Cart ─────────────────────────────────────────────────

  addToCart(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(product);
  }

  isInCart(productId: number): boolean {
    return this.cartService.isInCart(productId);
  }

  getCartQty(productId: number): number {
    return this.cartService.getQuantity(productId);
  }
}
