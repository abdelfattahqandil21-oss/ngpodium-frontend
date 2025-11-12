import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../env/env';
import { RefreshTokenResponse } from './interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'token';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly EXPIRES_AT_KEY = 'expiresAt';
  private readonly EXPIRES_IN_KEY = 'expiresIn';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  token = signal<string | null>(this.isBrowser ? localStorage.getItem(this.TOKEN_KEY) : null);
  refreshToken = signal<string | null>(this.isBrowser ? localStorage.getItem(this.REFRESH_TOKEN_KEY) : null);
  expiresAt = signal<string | null>(this.isBrowser ? localStorage.getItem(this.EXPIRES_AT_KEY) : null);
  expiresIn = signal<string | null>(this.isBrowser ? localStorage.getItem(this.EXPIRES_IN_KEY) : null);

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return this.token();
  }

  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  getExpiresAt(): string | null {
    return this.expiresAt();
  }

  getExpiresIn(): string | null {
    return this.expiresIn();
  }

  setToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
    this.token.set(token);
  }

  setRefreshToken(refresh: string) {
    if (this.isBrowser) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
    }
    this.refreshToken.set(refresh);
  }

  setExpiresAt(timestamp: number) {
    if (this.isBrowser) {
      localStorage.setItem(this.EXPIRES_AT_KEY, timestamp.toString());
    }
    this.expiresAt.set(timestamp.toString());
  }

  setExpiresIn(timestamp: number) {
    if (this.isBrowser) {
      localStorage.setItem(this.EXPIRES_IN_KEY, timestamp.toString());
    }
    this.expiresIn.set(timestamp.toString());
  }

  removeToken() {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.EXPIRES_IN_KEY);
      localStorage.removeItem(this.EXPIRES_AT_KEY);
    }
    this.token.set(null);
    this.refreshToken.set(null);
    this.expiresIn.set(null);
    this.expiresAt.set(null);
  }

  refreshTokenRequest() {
    const refresh = this.getRefreshToken();
    if (!refresh) throw new Error('No refresh token available');
    return this.http.post<RefreshTokenResponse>(
      `${environment.apiUrl}/auth/refresh`,
      { token: refresh }
    );
  }
}
