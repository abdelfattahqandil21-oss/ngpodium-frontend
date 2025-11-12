import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { TokenService } from '../token.service';
import { ProfileResponse, UpdateProfileRequest } from '../interfaces/auth.interface';
import { AuthService } from '../auth.service';
import { tap } from 'rxjs';

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
      const hasToken = !!this.tokenService.getToken();
      this._isLoggedIn.set(hasToken);
      
      // Auto-load profile if user is logged in but profile is not loaded
      if (hasToken && !this._profile()) {
        this.getProfile();
      }
      // console.log(`isLoggedIn: ${this.isLoggedIn()}`);
    });
  }

  login() {
    this._isLoggedIn.set(true);
  }
  logout() {
    this._isLoggedIn.set(false);
    this._profile.set(null);
    this.tokenService.removeToken();
  }
  getProfile() {
    this.authService.getProfile().subscribe({
      next: (res: ProfileResponse) => {
        console.log('Profile loaded:', res);
        this._profile.set(res);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this._profile.set(null);
      }
    });
  }

  updateProfile(payload: UpdateProfileRequest) {
    const currentProfile = this._profile();

    if (!currentProfile) {
      throw new Error('Cannot update profile before loading it.');
    }

    return this.authService.updateProfile(currentProfile.id, payload).pipe(
      tap((res) => {
        this._profile.set(res);
      })
    );
  }

  uploadProfileImage(file: File) {
    return this.authService.uploadProfileImage(file);
  }
}
