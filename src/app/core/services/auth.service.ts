import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  Api_URL = 'http://localhost:3000/api/auth';

  login(credentials: { email: string; password: string }) {
  }

  register(credentials: { email: string; password: string }) {
  }

  logout() {
  }
  refreshToken() {
  }
}
