import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

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

        <a mat-button routerLink="/auth-product" routerLinkActive="nav-active"
           id="nav-auth-product">
          <mat-icon>verified_user</mat-icon> Auth Products
        </a>

        <span class="nav-divider"></span>

        <button mat-button (click)="logout()" id="nav-logout">
          <mat-icon>logout</mat-icon> Logout
        </button>
      </ng-container>
    </mat-toolbar>

    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      /* ============================= */
      /* PREMIUM NAVBAR                */
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

      /* Nav links */
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

      /* Active route highlight */
      :host ::ng-deep .nav-active {
        color: #fff !important;
        background: rgba(167, 139, 250, 0.25) !important;
        border-bottom: 2px solid #a78bfa;
      }

      /* Vertical divider before logout */
      .nav-divider {
        width: 1px;
        height: 28px;
        background: rgba(255,255,255,0.15);
        margin: 0 8px;
      }

      .content {
        min-height: calc(100vh - 64px);
      }
    `,
  ],
})
export class AppComponent {
  title: any;
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
