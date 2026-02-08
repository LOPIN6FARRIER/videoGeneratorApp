import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // Signals
  private userSignal = signal<User | null>(this.getUserFromStorage());
  private tokenSignal = signal<string | null>(this.getTokenFromStorage());

  // Computed
  user = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    // TODO: Replace with actual API call
    // For now, mock authentication
    if (email && password) {
      const user: User = {
        id: '1',
        email,
        name: 'Admin User',
      };
      const token = 'mock-jwt-token';

      this.setAuth(user, token);
      return true;
    }
    return false;
  }

  logout(): void {
    this.userSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private setAuth(user: User, token: string): void {
    this.userSignal.set(user);
    this.tokenSignal.set(token);
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
