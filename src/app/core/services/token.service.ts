import { Injectable, signal } from '@angular/core';
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

  token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  refreshToken = signal<string | null>(localStorage.getItem(this.REFRESH_TOKEN_KEY));
  expiresAt = signal<string | null>(localStorage.getItem(this.EXPIRES_AT_KEY));
  expiresIn = signal<string | null>(localStorage.getItem(this.EXPIRES_IN_KEY));

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
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);
  }

  setRefreshToken(refresh: string) {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
    this.refreshToken.set(refresh);
  }

  setExpiresAt(timestamp: number) {
    localStorage.setItem(this.EXPIRES_AT_KEY, timestamp.toString());
    this.expiresAt.set(timestamp.toString());
  }

  setExpiresIn(timestamp: number) {
    localStorage.setItem(this.EXPIRES_IN_KEY, timestamp.toString());
    this.expiresIn.set(timestamp.toString());
  }

  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_IN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    this.token.set(null);
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
