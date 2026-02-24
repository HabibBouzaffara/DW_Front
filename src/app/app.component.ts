import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CartSidebarComponent } from './components/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span class="nav-title">📊 Sales DW</span>
      <span class="spacer"></span>

      <!-- ── Unauthenticated ── -->
      <a mat-button routerLink="/login" routerLinkActive="nav-active"
         *ngIf="!authService.isAuthenticated()">
        <mat-icon>login</mat-icon> Login
      </a>

      <!-- ── Authenticated links ── -->
      <ng-container *ngIf="authService.isAuthenticated()">

        <a mat-button routerLink="/dashboard" routerLinkActive="nav-active"
           *ngIf="authService.getUserRole() === '1'"
           id="nav-dashboard">
          <mat-icon>dashboard</mat-icon> Dashboard
        </a>

        <a mat-button routerLink="/products" routerLinkActive="nav-active"
           id="nav-products">
          <mat-icon>inventory_2</mat-icon> Products
        </a>

        <span class="nav-divider"></span>

        <!-- Change Password -->
        <button mat-button (click)="openResetModal()" id="nav-reset-password"
                class="nav-btn-reset" title="Change Password">
          <mat-icon>lock_reset</mat-icon> Change Password
        </button>

        <button mat-button (click)="logout()" id="nav-logout">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </ng-container>
    </mat-toolbar>

    <div class="content">
      <router-outlet></router-outlet>
    </div>

    <!-- Global cart sidebar (available on all pages) -->
    <app-cart-sidebar></app-cart-sidebar>
    <!-- ══════════════════════════════════════
         RESET PASSWORD MODAL
    ══════════════════════════════════════ -->
    <div class="rp-overlay" *ngIf="showResetModal" (click)="closeResetModal()">
      <div class="rp-modal" (click)="$event.stopPropagation()">

        <div class="rp-modal__header">
          <div class="rp-modal__icon">🔐</div>
          <div>
            <h2 class="rp-modal__title">Change Password</h2>
            <p class="rp-modal__sub">Your token is used automatically</p>
          </div>
          <button class="rp-modal__close" (click)="closeResetModal()" id="btn-close-reset">✕</button>
        </div>

        <!-- Success -->
        <div class="rp-success" *ngIf="resetSuccess">
          <span class="rp-success__icon">✅</span>
          <p>Password updated successfully!</p>
          <button class="rp-btn rp-btn--primary" (click)="closeResetModal()">Close</button>
        </div>

        <!-- Form -->
        <form *ngIf="!resetSuccess" class="rp-form" (ngSubmit)="submitReset()" #resetForm="ngForm">

          <div class="rp-field">
            <label for="rp-email">Email</label>
            <input id="rp-email" name="email" type="email"
                   [(ngModel)]="resetData.email" required
                   class="rp-input" placeholder="your@email.com" />
          </div>

          <div class="rp-field">
            <label for="rp-old">Current Password</label>
            <div class="rp-input-wrap">
              <input id="rp-old" name="oldPassword"
                     [type]="showOld ? 'text' : 'password'"
                     [(ngModel)]="resetData.oldPassword" required
                     class="rp-input" placeholder="Current password" />
              <button type="button" class="rp-eye" (click)="showOld = !showOld">
                <mat-icon>{{ showOld ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>
          </div>

          <div class="rp-field">
            <label for="rp-new">New Password</label>
            <div class="rp-input-wrap">
              <input id="rp-new" name="newPassword"
                     [type]="showNew ? 'text' : 'password'"
                     [(ngModel)]="resetData.newPassword" required minlength="6"
                     class="rp-input" placeholder="Min. 6 characters" />
              <button type="button" class="rp-eye" (click)="showNew = !showNew">
                <mat-icon>{{ showNew ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>
          </div>

          <!-- Error -->
          <div class="rp-error" *ngIf="resetError">⚠️ {{ resetError }}</div>

          <div class="rp-modal__footer">
            <button type="button" class="rp-btn rp-btn--ghost" (click)="closeResetModal()">Cancel</button>
            <button type="submit" class="rp-btn rp-btn--primary"
                    [disabled]="resetLoading || resetForm.invalid" id="btn-submit-reset">
              <span *ngIf="!resetLoading">Update Password</span>
              <span *ngIf="resetLoading" class="rp-saving">Saving…</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `,
  styles: [
    `
      /* ============================= */
      /* NAVBAR                        */
      /* ============================= */

      mat-toolbar {
        background: linear-gradient(90deg, #0f0c29 0%, #302b63 100%);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        padding: 0 24px;
        height: 64px;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      }

      .nav-title {
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: 0.5px;
        background: linear-gradient(90deg, #a78bfa, #60a5fa);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-right: 1.5rem;
      }

      .spacer { flex: 1; }

      mat-toolbar a[mat-button],
      mat-toolbar button[mat-button] {
        color: rgba(255,255,255,0.75);
        font-size: 0.875rem;
        font-weight: 500;
        letter-spacing: 0.3px;
        border-radius: 8px;
        margin: 0 2px;
        transition: background 0.2s, color 0.2s, transform 0.15s;
      }

      mat-toolbar a[mat-button]:hover,
      mat-toolbar button[mat-button]:hover {
        color: #fff;
        background: rgba(167, 139, 250, 0.15);
        transform: translateY(-1px);
      }

      :host ::ng-deep .nav-active {
        color: #fff !important;
        background: rgba(167, 139, 250, 0.25) !important;
        border-bottom: 2px solid #a78bfa;
      }

      .nav-divider {
        width: 1px;
        height: 28px;
        background: rgba(255,255,255,0.15);
        margin: 0 8px;
      }

      /* Change password button — subtle amber tint */
      .nav-btn-reset {
        color: rgba(251,191,36,0.85) !important;
      }
      .nav-btn-reset:hover {
        color: #fbbf24 !important;
        background: rgba(251,191,36,0.12) !important;
      }

      .content { min-height: calc(100vh - 64px); }

      /* ═══════════════════════════════════
         RESET PASSWORD MODAL
      ═══════════════════════════════════ */

      .rp-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.65);
        backdrop-filter: blur(8px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: rpFade 0.15s ease;
      }

      @keyframes rpFade { from { opacity: 0; } to { opacity: 1; } }

      .rp-modal {
        background: linear-gradient(145deg, #1e1b4b, #16213e);
        border: 1px solid rgba(167,139,250,0.2);
        border-radius: 22px;
        width: 100%;
        max-width: 440px;
        box-shadow: 0 32px 80px rgba(0,0,0,0.7);
        overflow: hidden;
        animation: rpSlide 0.2s ease;
        font-family: 'Inter', 'Segoe UI', sans-serif;
      }

      @keyframes rpSlide {
        from { transform: translateY(20px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }

      .rp-modal__header {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 1.5rem 1.5rem 1.1rem;
        border-bottom: 1px solid rgba(255,255,255,0.07);
      }

      .rp-modal__icon { font-size: 1.8rem; line-height: 1; }

      .rp-modal__title {
        margin: 0 0 0.15rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: #f1f5f9;
      }

      .rp-modal__sub {
        margin: 0;
        font-size: 0.78rem;
        color: #64748b;
      }

      .rp-modal__close {
        margin-left: auto;
        background: none;
        border: none;
        color: #64748b;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.35rem 0.55rem;
        border-radius: 7px;
        transition: color 0.2s, background 0.2s;
        line-height: 1;
        flex-shrink: 0;
      }
      .rp-modal__close:hover { color: #f1f5f9; background: rgba(255,255,255,0.08); }

      .rp-form {
        padding: 1.35rem 1.5rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .rp-field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .rp-field label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .rp-input-wrap { position: relative; display: flex; }

      .rp-input {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        padding: 0.65rem 2.8rem 0.65rem 0.9rem;
        color: #e2e8f0;
        font-size: 0.9rem;
        outline: none;
        width: 100%;
        box-sizing: border-box;
        transition: border-color 0.2s, background 0.2s;
      }

      /* plain input (no wrap) */
      .rp-field > .rp-input {
        padding-right: 0.9rem;
      }

      .rp-input::placeholder { color: #475569; }
      .rp-input:focus { border-color: #a78bfa; background: rgba(167,139,250,0.06); }

      .rp-eye {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 0.2rem;
        transition: color 0.2s;
      }
      .rp-eye:hover { color: #a78bfa; }
      .rp-eye mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

      .rp-error {
        background: rgba(248,113,113,0.1);
        border: 1px solid rgba(248,113,113,0.25);
        border-radius: 9px;
        padding: 0.65rem 0.9rem;
        color: #f87171;
        font-size: 0.85rem;
      }

      .rp-success {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2.5rem 1.5rem;
        text-align: center;
        color: #86efac;
        font-size: 1rem;
      }
      .rp-success__icon { font-size: 2.5rem; }

      .rp-modal__footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding-top: 0.25rem;
      }

      .rp-btn {
        border: none;
        border-radius: 10px;
        padding: 0.65rem 1.4rem;
        font-size: 0.875rem;
        font-weight: 700;
        cursor: pointer;
        transition: opacity 0.2s, transform 0.15s;
        font-family: inherit;
      }
      .rp-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
      .rp-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      .rp-btn--primary {
        background: linear-gradient(90deg, #7c3aed, #4f46e5);
        color: #fff;
        box-shadow: 0 4px 16px rgba(124,58,237,0.3);
      }

      .rp-btn--ghost {
        background: rgba(255,255,255,0.07);
        color: #94a3b8;
        border: 1px solid rgba(255,255,255,0.1);
      }

      .rp-saving { opacity: 0.7; }
    `,
  ],
})
export class AppComponent {
  title: any;

  // ── Reset Password modal state ──────────────────────────
  showResetModal = false;
  resetLoading = false;
  resetSuccess = false;
  resetError = '';
  showOld = false;
  showNew = false;

  resetData = { email: '', oldPassword: '', newPassword: '' };

  constructor(public authService: AuthService, private router: Router) {}

  // ── Navbar actions ──────────────────────────────────────

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // ── Reset modal ─────────────────────────────────────────

  openResetModal(): void {
    this.resetData = { email: '', oldPassword: '', newPassword: '' };
    this.resetError = '';
    this.resetSuccess = false;
    this.showOld = false;
    this.showNew = false;
    this.showResetModal = true;
  }

  closeResetModal(): void {
    this.showResetModal = false;
  }

  submitReset(): void {
    this.resetError = '';
    this.resetLoading = true;

    const { email, oldPassword, newPassword } = this.resetData;

    this.authService.resetPassword(email, oldPassword, newPassword).subscribe({
      next: () => {
        this.resetLoading = false;
        this.resetSuccess = true;
      },
      error: (err) => {
        this.resetLoading = false;
        this.resetError = err?.error?.message || 'Password update failed. Please check your credentials.';
      },
    });
  }
}
