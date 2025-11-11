import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { TokenService } from '../token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private readonly _isLoggedIn = signal(false);
  readonly token$ = signal<string | null>(null); // أو BehaviorSubject
  readonly isLoggedIn = computed(() => this._isLoggedIn());
  private tokenService = inject(TokenService);
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
}
