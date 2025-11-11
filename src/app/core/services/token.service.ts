import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'token';
  private readonly EXPIRES_IN_KEY = 'expiresIn';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  expiresIn = signal<string | null>(localStorage.getItem(this.EXPIRES_IN_KEY));
  refreshToken = signal<string | null>(localStorage.getItem(this.REFRESH_TOKEN_KEY));

  getToken(): string | null {
    return this.token();
  }

  getExpiresIn(): string | null {
    return this.expiresIn();
  }

  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);
  }

  setExpiresIn(expiresIn: string): void {
    localStorage.setItem(this.EXPIRES_IN_KEY, expiresIn);
    this.expiresIn.set(expiresIn);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.refreshToken.set(refreshToken);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_IN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.token.set(null);
    this.expiresIn.set(null);
    this.refreshToken.set(null);
  }

  clear(): void {
    localStorage.clear();
    this.token.set(null);
    this.expiresIn.set(null);
    this.refreshToken.set(null);
  }
}
