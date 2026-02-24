// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';
import { CommandService, CommandResponse } from './command.service';

const CART_KEY = 'dw_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadFromStorage());

  /** Reactive cart items array */
  items$ = this.itemsSubject.asObservable();

  constructor(private commandService: CommandService) {}

  // ── Getters ─────────────────────────────────────────────────

  get items(): CartItem[] {
    return this.itemsSubject.value;
  }

  get totalCount(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  get totalPrice(): number {
    return this.items.reduce((sum, i) => sum + i.product.listPrice * i.quantity, 0);
  }

  // ── Actions ─────────────────────────────────────────────────

  addToCart(product: Product, qty = 1): void {
    const current = [...this.items];
    const existing = current.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      current.push({ product, quantity: qty });
    }
    this.persist(current);
  }

  removeFromCart(productId: number): void {
    const updated = this.items.filter((i) => i.product.id !== productId);
    this.persist(updated);
  }

  updateQuantity(productId: number, qty: number): void {
    if (qty <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const current = [...this.items];
    const existing = current.find((i) => i.product.id === productId);
    if (existing) {
      existing.quantity = qty;
      this.persist(current);
    }
  }

  clearCart(): void {
    this.persist([]);
  }

  isInCart(productId: number): boolean {
    return this.items.some((i) => i.product.id === productId);
  }

  getQuantity(productId: number): number {
    return this.items.find((i) => i.product.id === productId)?.quantity ?? 0;
  }

  // ── Order submission ─────────────────────────────────────────
  /**
   * Creates a Command on the backend, then a CommandLine for every cart item
   * (sequentially to respect FK constraints), then clears local storage.
   *
   * Returns an Observable that emits the CommandResponse on success.
   */
  submitOrder(): Observable<CommandResponse> {
    const itemsToOrder = [...this.items];

    if (itemsToOrder.length === 0) {
      return throwError(() => new Error('Cart is empty'));
    }

    return new Observable<CommandResponse>((observer) => {
      // Step 1 — create the parent command
      this.commandService.createCommand().subscribe({
        next: (cmd) => {
          // Step 2 — create each command line sequentially
          from(itemsToOrder)
            .pipe(
              concatMap((item) =>
                this.commandService.createCommandLine({
                  commandLineId: 0,
                  commandId: cmd.commandId,
                  productId: item.product.id,
                  quantity: item.quantity,
                  command: null,
                })
              ),
              toArray()
            )
            .subscribe({
              next: () => {
                // Step 3 — clear the cart
                this.clearCart();
                observer.next(cmd);
                observer.complete();
              },
              error: (err) => observer.error(err),
            });
        },
        error: (err) => observer.error(err),
      });
    });
  }

  // ── Storage helpers ──────────────────────────────────────────

  private persist(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.itemsSubject.next(items);
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
