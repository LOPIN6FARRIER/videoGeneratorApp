import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  statusCode?: number;
}

interface AuthUrlResponse {
  authUrl: string;
  state: string;
}

interface AuthStatusResponse {
  isAuthenticated: boolean;
  expiresAt?: number;
}

interface GoogleOAuthConfig {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
}

@Injectable({
  providedIn: 'root',
})
export class YoutubeAuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/youtube-auth`;

  /**
   * Obtiene la configuración OAuth desde google.json
   */
  getGoogleConfig(): Observable<GoogleOAuthConfig> {
    return this.http
      .get<ApiResponse<GoogleOAuthConfig>>(`${this.apiUrl}/google-config`)
      .pipe(map((response) => response.data));
  }

  /**
   * Genera la URL de autenticación OAuth2 para un canal
   */
  getAuthUrl(channelId: string): Observable<AuthUrlResponse> {
    return this.http
      .get<ApiResponse<AuthUrlResponse>>(`${this.apiUrl}/${channelId}/auth-url`)
      .pipe(map((response) => response.data));
  }

  /**
   * Verifica el estado de autenticación de un canal
   */
  checkAuthStatus(channelId: string): Observable<AuthStatusResponse> {
    return this.http
      .get<ApiResponse<AuthStatusResponse>>(`${this.apiUrl}/${channelId}/status`)
      .pipe(map((response) => response.data));
  }

  /**
   * Revoca la autenticación de YouTube para un canal
   */
  revokeAuth(channelId: string): Observable<{ success: boolean }> {
    return this.http
      .delete<ApiResponse<{ success: boolean }>>(`${this.apiUrl}/${channelId}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Envía el código de autorización manualmente
   */
  submitManualCode(channelId: string, code: string): Observable<{ success: boolean }> {
    return this.http
      .post<ApiResponse<{ success: boolean }>>(`${this.apiUrl}/${channelId}/manual-code`, {
        code,
      })
      .pipe(map((response) => response.data));
  }

  /**
   * Abre una ventana popup para el flujo OAuth2
   */
  openAuthPopup(authUrl: string): Window | null {
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    return window.open(
      authUrl,
      'YouTube OAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
    );
  }
}
