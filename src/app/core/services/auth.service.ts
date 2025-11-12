import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../env/env';
import {
  ILogin,
  IRegister,
  LoginResponse,
  RegisterResponse,
  LogoutResponse,
  RefreshTokenResponse,
  ProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UploadProfileResponse,
} from './interfaces/auth.interface';
import { TokenService } from './token.service';
import { interval, Subscription, switchMap, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly Base_URL = environment.apiUrl;

  private refreshSub?: Subscription;

  constructor() {
    const token = this.tokenService.getToken();
    if (token) {
      this.startAutoRefresh();
    }
  }

  login(credentials: ILogin) {
    return this.http.post<LoginResponse>(`${this.Base_URL}/auth/login`, credentials);
  }

  register(credentials: IRegister) {
    return this.http.post<RegisterResponse>(`${this.Base_URL}/auth/register`, credentials);
  }

  logout() {
    this.stopAutoRefresh();
    return this.http.post<LogoutResponse>(`${this.Base_URL}/auth/logout`, {});
  }

  refreshToken(token: string) {
    return this.http.post<RefreshTokenResponse>(`${this.Base_URL}/auth/refresh`, { token });
  }

  getProfile() {
    return this.http.get<ProfileResponse>(`${this.Base_URL}/auth/profile`);
  }

  updateProfile(id: number, payload: UpdateProfileRequest) {
    return this.http.patch<UpdateProfileResponse>(`${this.Base_URL}/users/${id}`, payload);
  }

  uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadProfileResponse>(`${this.Base_URL}/upload/profile`, formData);
  }


  startAutoRefresh() {
    const expiresIn = this.tokenService.getExpiresIn();
    if (!expiresIn) {
      console.error('No expiration time found');
      return this.stopAutoRefresh();
    }

    const expiresInMs = +expiresIn * 1000;
    const refreshBefore = Math.max(expiresInMs - 60_000, 60_000);

    this.stopAutoRefresh();

    this.refreshSub = interval(refreshBefore)
      .pipe(
        filter(() => !!this.tokenService.getToken()),
        switchMap(() => this.refreshToken(this.tokenService.getRefreshToken()!))
      )
      .subscribe({
        next: (res) => {
          this.tokenService.setToken(res.access_token);
          console.log('Token refreshed successfully');
        }
      });
  }

  stopAutoRefresh() {
    this.refreshSub?.unsubscribe();
    this.refreshSub = undefined;
  }
}
