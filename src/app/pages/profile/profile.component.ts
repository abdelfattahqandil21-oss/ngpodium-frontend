import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../env/env';
import { AuthStateService } from '../../core/services/state/auth-state.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white">
      <div class="container mx-auto px-4 py-10 max-w-4xl space-y-8">
        <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold">Profile</h1>
            <p class="text-zinc-400 mt-1">Your personal information and contact details</p>
          </div>

          <a
            [routerLink]="['/profile/edit']"
            class="inline-flex items-center justify-center rounded-full bg-linear-to-r from-zinc-700 via-zinc-600 to-zinc-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/50 transition duration-300 hover:-translate-y-0.5 hover:from-zinc-600 hover:to-zinc-400 hover:shadow-[0_0_25px_rgba(255,255,255,0.12)]"
          >
            Edit Profile
          </a>
        </header>

        @if (!isLoggedIn()) {
          <div class="rounded-xl border border-white/10 bg-red-500/10 p-6 text-red-200">
            <h2 class="text-xl font-semibold mb-2">You are not signed in</h2>
            <p class="text-sm">Please log in to view your profile.</p>
            <a routerLink="/login" class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
              Go to Login
            </a>
          </div>
        } @else {
          @if (!profile()) {
            <div class="flex justify-center items-center py-20">
              <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          } @else {
            <section class="rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-md p-8 shadow-lg shadow-black/30">
              <div class="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <img
                  [src]="avatarUrl()"
                  [alt]="profile()!.username"
                  class="h-32 w-32 rounded-full border-4 border-white/10 object-cover shadow-lg"
                />

                <div class="flex-1 space-y-5 text-center md:text-left">
                  <div class="space-y-1">
                    <h2 class="text-2xl font-semibold">{{ profile()!.username }}</h2>
                    @if (profile()!.headline) {
                      <p class="text-sm text-emerald-300">{{ profile()!.headline }}</p>
                    }
                    @if (profile()!.nickname) {
                      <p class="text-zinc-400">{{ profile()!.nickname }}</p>
                    }
                  </div>

                  <div class="grid gap-3 md:grid-cols-2">
                    <div class="rounded-lg border border-white/5 bg-white/5 p-4">
                      <p class="text-sm uppercase tracking-wide text-zinc-400">Email</p>
                      <p class="font-medium text-white wrap-break-word">{{ profile()!.email }}</p>
                    </div>

                    <div class="rounded-lg border border-white/5 bg-white/5 p-4">
                      <p class="text-sm uppercase tracking-wide text-zinc-400">Phone</p>
                      <p class="font-medium text-white">{{ profile()!.phone || 'Not provided' }}</p>
                    </div>

                    <div class="rounded-lg border border-white/5 bg-white/5 p-4">
                      <p class="text-sm uppercase tracking-wide text-zinc-400">Member Since</p>
                      <p class="font-medium text-white">{{ profile()!.createdAt | date: 'longDate' }}</p>
                    </div>

                    <div class="rounded-lg border border-white/5 bg-white/5 p-4">
                      <p class="text-sm uppercase tracking-wide text-zinc-400">Last Updated</p>
                      <p class="font-medium text-white">{{ profile()!.updatedAt | date: 'medium' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .container {
      transition: opacity 0.3s ease;
    }
  `],
})
export class ProfilePageComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  readonly profile = this.authState.profile;
  readonly isLoggedIn = this.authState.isLoggedIn;

  private readonly profileBaseUrl = environment.profile;

  readonly avatarUrl = computed(() => this.buildAvatarUrl());

  ngOnInit(): void {
    if (!this.isLoggedIn()) {
      return;
    }

    if (!this.profile()) {
      this.authState.getProfile();
    }
  }

  private buildAvatarUrl(): string {
    const profileData = this.profile();

    if (!profileData?.image) {
      return '/assets/avatar.png';
    }

    if (profileData.image.startsWith('http://') || profileData.image.startsWith('https://')) {
      return profileData.image;
    }

    let imagePath = profileData.image.replace(/^https?:\/\/[^\/]+/, '');

    if (!imagePath.startsWith('/')) {
      return this.profileBaseUrl + imagePath;
    }

    if (imagePath.startsWith('/uploads/profile/')) {
      return 'http://localhost:3000' + imagePath;
    }

    return this.profileBaseUrl + imagePath;
  }
}
