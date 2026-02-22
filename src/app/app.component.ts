import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html', // better than inline template
  styleUrls: ['./app.component.css'],
  template: `
    <mat-toolbar color="primary">
      <span>Sales DW Dashboard</span>
      <span class="spacer"></span>
      <button
        mat-button
        routerLink="/login"
        *ngIf="!authService.isAuthenticated()"
      >
        Login
      </button>
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
    `,
  ],
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
