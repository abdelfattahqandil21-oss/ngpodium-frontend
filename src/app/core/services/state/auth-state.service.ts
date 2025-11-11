import { Injectable, computed, inject, signal } from '@angular/core';
import { TokenService } from '../token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly _isLoggedIn = signal(false);
  readonly isLoggedIn = computed(() => this._isLoggedIn());
  private tokenService = inject(TokenService);
  constructor() {
    this._isLoggedIn.set(!!this.tokenService.getToken());
  }

  login() { this._isLoggedIn.set(true); }
  logout() { this._isLoggedIn.set(false); this.tokenService.clear(); }
}
