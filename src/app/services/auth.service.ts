// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthUser } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token'),
  );
  private roleSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  register(email: string, password: string): Observable<AuthUser> {
    return this.http.post<AuthUser>('/api/auth/register', { email, password });
  }

  login(email: string, password: string): Observable<string> {
    return this.http
      .post<{ token: string }>('/api/auth/login', { email, password })
      .pipe(
        tap(({ token }) => {
          this.tokenSubject.next(token);
          localStorage.setItem('token', token); // Memory: use private var instead
          this.roleSubject.next(this.parseRole(token));
        }),
        map(({ token }) => token),
      );
  }

  logout(): void {
    this.tokenSubject.next(null);
    localStorage.removeItem('token');
    this.roleSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getUserRole(): string | null {
    return this.roleSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private parseRole(token: string): string | null {
    try {
      return JSON.parse(atob(token.split('.')[1])).role || null;
    } catch {
      return null;
    }
  }
}
