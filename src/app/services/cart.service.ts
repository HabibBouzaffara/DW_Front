// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart-item.model';
import { CommandService, CommandResponse } from './command.service';
import { AuthService } from './auth.service';

const CART_KEY = 'dw_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>(this.loadFromStorage());

  /** Reactive cart items array */
  items$ = this.itemsSubject.asObservable();

  constructor(
    private commandService: CommandService,
    private auth: AuthService
  ) {
    // no-op: cart is entirely client‑side until order submission
  }

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
    // simply clear the local state; the backend will only see data when the
    // user places an order.
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
   * Sends the current cart to the backend as a single order.  The server
   * will create a new command with `approved = 1` and one line per product.
   * Only authenticated users may place orders; guests should be redirected to
   * login before calling this method.
   */
  submitOrder(): Observable<CommandResponse> {
    const itemsToOrder = [...this.items];

    if (itemsToOrder.length === 0) {
      return throwError(() => new Error('Cart is empty'));
    }

    if (!this.auth.isAuthenticated()) {
      return throwError(() => new Error('You must be logged in to place an order'));
    }

    return new Observable<CommandResponse>((observer) => {
      this.commandService.createCommand(1).subscribe({
        next: (cmd) => {
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
    // update in‑memory so subscribers see the change
    this.itemsSubject.next(items);

    // always keep a local copy; the server is only hit when placing an order
    localStorage.setItem(CART_KEY, JSON.stringify(items));
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
