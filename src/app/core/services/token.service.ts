import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'token';
  private readonly EXPIRES_AT_KEY = 'expiresAt';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';


  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY );
  }

  getExpiresAt(): string | null {
    return localStorage.getItem(this.EXPIRES_AT_KEY );
  }
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY );
  }
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY , token);
  }
  setExpiresAt(expiresAt: string): void {
    localStorage.setItem(this.EXPIRES_AT_KEY , expiresAt);
  }
  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY , refreshToken);
  }
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY );
    localStorage.removeItem(this.EXPIRES_AT_KEY );
    localStorage.removeItem(this.REFRESH_TOKEN_KEY );
  }

  clear(): void {
    localStorage.clear();
  }
}
