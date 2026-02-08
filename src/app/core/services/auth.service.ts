import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken: string;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'auth_user';
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals
  private userSignal = signal<User | null>(this.getUserFromStorage());
  private tokenSignal = signal<string | null>(this.getTokenFromStorage());

  // Computed
  user = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());

  constructor() {
    // Verify token on initialization
    this.verifyToken();
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.user && response.token) {
            this.setAuth(response.user, response.token, response.refreshToken);
            this.router.navigate(['/dashboard']);
          }
        }),
        map((response) => response.success),
        catchError((error) => {
          console.error('Login error:', error);
          return of(false);
        }),
      );
  }

  logout(): void {
    const token = this.getToken();

    if (token) {
      // Call logout endpoint
      this.http
        .post(`${environment.apiUrl}/auth/logout`, {})
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    this.clearAuth();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return of(false);
    }

    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          if (response.success && response.user && response.token) {
            this.setAuth(response.user, response.token);
          }
        }),
        map((response) => response.success),
        catchError(() => {
          this.clearAuth();
          return of(false);
        }),
      );
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private verifyToken(): void {
    const token = this.getToken();

    if (!token) {
      return;
    }

    // Verify token with backend
    this.http
      .get<{ success: boolean; user: User }>(`${environment.apiUrl}/auth/me`)
      .pipe(
        tap((response) => {
          if (response.success && response.user) {
            this.userSignal.set(response.user);
          } else {
            this.clearAuth();
          }
        }),
        catchError(() => {
          this.clearAuth();
          return of(null);
        }),
      )
      .subscribe();
  }

  private setAuth(user: User, token: string, refreshToken?: string): void {
    this.userSignal.set(user);
    this.tokenSignal.set(token);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private clearAuth(): void {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
