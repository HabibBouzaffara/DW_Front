import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <span class="nav-title">Sales DW Dashboard</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/login" *ngIf="!authService.isAuthenticated()">
        <mat-icon>login</mat-icon>
        Login
      </a>
      <a
        mat-button
        routerLink="/dashboard"
        *ngIf="authService.getUserRole() === '1'"
      >
        <mat-icon>dashboard</mat-icon>
        Dashboard
      </a>
      <button
        mat-button
        (click)="logout()"
        *ngIf="authService.isAuthenticated()"
      >
        <mat-icon>logout</mat-icon>
        Logout
      </button>
    </mat-toolbar>
    <div class="content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      /* ============================= */
      /* PREMIUM NAVBAR */
      /* ============================= */

      mat-toolbar {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        padding: 0 30px;
        height: 70px;
      }

      /* Title */
      .nav-title {
        font-size: 20px;
        font-weight: 600;
        letter-spacing: 1px;
      }

      /* Spacer */
      .spacer {
        flex: 1;
      }

      /* Buttons */
      mat-toolbar button {
        color: white;
        transition: 0.3s;
      }

      mat-toolbar button:hover {
        color: #38bdf8;
        transform: translateY(-2px);
      }
    `,
  ],
})
export class AppComponent {
  title: any;
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
    window.location.reload(); // Reload the page to update UI state
  }
}
