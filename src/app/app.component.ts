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
      <span>Sales DW Dashboard</span>
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
      .content {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }
      .spacer {
        flex: 1 1 auto;
      }
      mat-toolbar {
        justify-content: space-between;
      }
    `,
  ],
})
export class AppComponent {
  title: any;
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
