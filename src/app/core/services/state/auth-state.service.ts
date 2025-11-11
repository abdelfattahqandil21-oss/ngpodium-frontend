import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { TokenService } from '../token.service';
import { ProfileResponse } from '../interfaces/auth.interface';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly _isLoggedIn = signal(false);
  readonly token$ = signal<string | null>(null); 
  readonly isLoggedIn = computed(() => this._isLoggedIn());
  private tokenService = inject(TokenService);
  private authService = inject(AuthService);
  private _profile = signal<ProfileResponse | null>(null);
  readonly profile = computed(() => this._profile());
  constructor() {
    effect(() => {
      this._isLoggedIn.set(!!this.tokenService.getToken());
      // console.log(`isLoggedIn: ${this.isLoggedIn()}`);
    });
  }

  login() {
    this._isLoggedIn.set(true);
  }
  logout() {
    this._isLoggedIn.set(false);
    this.tokenService.clear();
  }
  getProfile() {
    this.authService.getProfile().subscribe((res : ProfileResponse) => {
      this._profile.set(res);
    });
  }
}
