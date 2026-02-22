// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token'),
  );

  private roleSubject = new BehaviorSubject<string | null>(
    this.getRoleFromStoredToken(),
  );

  constructor(private http: HttpClient) {}

  // ===============================
  // REGISTER
  // ===============================

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/auth/register`, {
      email,
      password,
    });
  }

  // ===============================
  // LOGIN
  // ===============================

  login(email: string, password: string): Observable<string> {
    return this.http
      .post<{
        token: string;
      }>(`${environment.apiBaseUrl}/auth/login`, { email, password })
      .pipe(
        tap(({ token }) => {
          localStorage.setItem('token', token);
          this.tokenSubject.next(token);
          this.roleSubject.next(this.parseRole(token));
        }),
        map((res) => res.token),
      );
  }

  // ===============================
  // LOGOUT
  // ===============================

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
    this.roleSubject.next(null);
  }

  // ===============================
  // AUTH STATE
  // ===============================

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getUserRole(): string | null {
    return this.roleSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    return !this.isTokenExpired(token);
  }

  // ===============================
  // TOKEN HELPERS
  // ===============================

  private parseRole(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // .NET role claim support
      return (
        payload.role ||
        payload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] ||
        null
      );
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;

      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }

  private getRoleFromStoredToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return this.parseRole(token);
  }
  forgotPassword(email: string) {
    return this.http.post('api/forgot-password', { email });
  }
  resetPassword(email: string, oldPassword: string, newPassword: string) {
    return this.http.put(`${environment.apiBaseUrl}/Auth/reset-password`, {
      email,
      oldPassword,
      newPassword,
    });
  }
}
