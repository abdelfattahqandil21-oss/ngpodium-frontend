import { environment } from '../../../env/env';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ILogin, IRegister, ILogout, IrefreshToken,LoginResponse,LogoutResponse,ProfileResponse,RefreshTokenResponse,RegisterResponse } from './interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  private Base_URL = environment.apiUrl
  private img_URL = environment.imgUrl



  login(credentials: ILogin) {
    return this.http.post<LoginResponse>(`${this.Base_URL}/auth/login`, credentials);
  }

  register(credentials: IRegister) {
    return this.http.post<RegisterResponse>(`${this.Base_URL}/auth/register`, credentials);
  }

  logout() {
    return this.http.post<LogoutResponse>(`${this.Base_URL}/auth/logout`, {});
  }
  refreshToken() {
    return this.http.post<RefreshTokenResponse>(`${this.Base_URL}/auth/refresh-token`, {});
  }
}
