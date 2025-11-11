import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'token';
  private readonly EXPIRES_AT_KEY = 'expiresAt';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';

  // Signals للتوكن ومدة الانتهاء والرفريش توكن
  token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  expiresAt = signal<string | null>(localStorage.getItem(this.EXPIRES_AT_KEY));
  refreshToken = signal<string | null>(localStorage.getItem(this.REFRESH_TOKEN_KEY));

  // Getters
  getToken(): string | null {
    return this.token();
  }

  getExpiresAt(): string | null {
    return this.expiresAt();
  }

  getRefreshToken(): string | null {
    return this.refreshToken();
  }

  // Setters مع تحديث Signals و localStorage
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.token.set(token);
  }

  setExpiresAt(expiresAt: string): void {
    localStorage.setItem(this.EXPIRES_AT_KEY, expiresAt);
    this.expiresAt.set(expiresAt);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    this.refreshToken.set(refreshToken);
  }

  // إزالة توكن واحد أو كل حاجة
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.token.set(null);
    this.expiresAt.set(null);
    this.refreshToken.set(null);
  }

  clear(): void {
    localStorage.clear();
    this.token.set(null);
    this.expiresAt.set(null);
    this.refreshToken.set(null);
  }
}
