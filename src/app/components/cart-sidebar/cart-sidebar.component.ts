import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/cart-item.model';

type OrderStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrls: ['./cart-sidebar.component.css'],
})
export class CartSidebarComponent implements OnDestroy {
  isOpen = false;
  items: CartItem[] = [];
  orderStatus: OrderStatus = 'idle';
  lastCommandId: number | null = null;
  orderError = '';

  private sub: Subscription;

  constructor(
    public cartService: CartService,
    public authService: AuthService
  ) {
    this.sub = this.cartService.items$.subscribe((items) => {
      this.items = items;
      // Reset order status when cart contents change
      if (this.orderStatus === 'success' || this.orderStatus === 'error') {
        this.orderStatus = 'idle';
      }
    });
  }

  get totalCount(): number {
    return this.cartService.totalCount;
  }

  get totalPrice(): number {
    return this.cartService.totalPrice;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get isOrdering(): boolean {
    return this.orderStatus === 'loading';
  }

  open(): void {
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  increment(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity - 1);
  }

  remove(item: CartItem): void {
    this.cartService.removeFromCart(item.product.id);
  }

  /**
   * Submits the cart as a Command + CommandLines via the backend API.
   * Only reachable when authenticated (button is *ngIf="isAuthenticated").
   */
  placeOrder(): void {
    if (this.isOrdering) return;
    this.orderStatus = 'loading';
    this.orderError = '';

    this.cartService.submitOrder().subscribe({
      next: (cmd) => {
        this.orderStatus = 'success';
        this.lastCommandId = cmd.commandId;
        // Auto-close after 2.5 s
        setTimeout(() => {
          this.orderStatus = 'idle';
          this.lastCommandId = null;
          this.close();
        }, 2500);
      },
      error: (err) => {
        this.orderStatus = 'error';
        this.orderError =
          err?.error?.message || err?.message || 'Order submission failed. Please try again.';
      },
    });
  }

  clearAll(): void {
    this.cartService.clearCart();
    this.orderStatus = 'idle';
  }

  dismissError(): void {
    this.orderStatus = 'idle';
    this.orderError = '';
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
