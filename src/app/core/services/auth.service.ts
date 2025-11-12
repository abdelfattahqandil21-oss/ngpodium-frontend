import { Injectable, inject, signal } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenService = inject(TokenService);
  private readonly Base_URL = environment.apiUrl;

  isUnauthorized = signal(false);
  setUnauthorized(value: boolean) {
    this.isUnauthorized.set(value);
  }

  constructor() {}

  login(credentials: ILogin) {
    return this.http.post<LoginResponse>(`${this.Base_URL}/auth/login`, credentials);
  }

  register(credentials: IRegister) {
    return this.http.post<RegisterResponse>(`${this.Base_URL}/auth/register`, credentials);
  }

  logout() {
    this.tokenService.removeToken();
    this.setUnauthorized(true);
    return this.http.post<LogoutResponse>(`${this.Base_URL}/auth/logout`, {});
  }

  refreshToken(refreshToken: string) {
    return this.http.post<RefreshTokenResponse>(`${this.Base_URL}/auth/refresh`, { token: refreshToken });
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
}
