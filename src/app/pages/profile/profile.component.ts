import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../env/env';
import { AuthStateService } from '../../core/services/state/auth-state.service';
import { profileImageUrl } from '../../shared/utils/image-url.util';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-zinc-950 text-white">
      <div class="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10">
        <header class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">Account</p>
          <h1 class="text-3xl md:text-4xl font-bold">Your Profile</h1>
          <p class="text-sm text-zinc-400 md:text-base">Manage your public information, contact details, and account activity.</p>
        </header>

        @if (!isLoggedIn()) {
          <div class="rounded-3xl border border-white/10 bg-red-500/10 p-6 text-red-200">
            <h2 class="text-xl font-semibold mb-2">You are not signed in</h2>
            <p class="text-sm">Please log in to view your profile.</p>
            <a routerLink="/login" class="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
              Go to Login
            </a>
          </div>
        } @else {
          @if (!profile()) {
            <div class="flex justify-center items-center py-20">
              <div class="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          } @else {
            <section class="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.85)]">
              <div class="h-64 w-full overflow-hidden">
                <img
                  [src]="avatarUrl()"
                  [alt]="profile()!.username + ' cover'"
                  class="h-full w-full object-cover"
                />
              </div>

              <div class="flex flex-col gap-6 px-6 pb-5 pt-4 md:flex-row md:items-end md:justify-between md:px-10">
                <div class="mt-2 flex items-center gap-4 md:mt-4 md:gap-6">
                  <div class="h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-zinc-900 shadow-xl md:h-32 md:w-32">
                    <img
                      [src]="avatarUrl()"
                      [alt]="profile()!.username"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <div class="flex flex-col gap-2 md:gap-3">
                    <h2 class="text-2xl font-bold md:text-3xl lg:text-4xl">{{ profile()!.username }}</h2>
                    @if (profile()!.headline) {
                      <p class="max-w-xl text-sm text-sky-200 md:text-base">{{ profile()!.headline }}</p>
                    }
                    @if (profile()!.nickname) {
                      <p class="text-sm text-zinc-400 md:text-base">@{{ profile()!.nickname }}</p>
                    }
                  </div>
                </div>

                <a
                  [routerLink]="['/profile/edit']"
                  class="inline-flex items-center justify-center rounded-full bg-linear-to-r from-zinc-200 to-white px-5 py-2 text-sm font-semibold text-zinc-900 shadow-lg shadow-zinc-900/40 transition hover:-translate-y-0.5 hover:shadow-zinc-200/70"
                >
                  Edit Profile
                </a>
              </div>
            </section>

            <section class="mt-12 grid gap-6 md:grid-cols-2">
              <article class="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Email</p>
                <p class="mt-3 text-lg font-medium text-white wrap-break-word">{{ profile()!.email }}</p>
              </article>

              <article class="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Phone</p>
                <p class="mt-3 text-lg font-medium text-white">{{ profile()!.phone || 'Not provided' }}</p>
              </article>

              <article class="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Member Since</p>
                <p class="mt-3 text-lg font-medium text-white">{{ profile()!.createdAt | date: 'longDate' }}</p>
              </article>

              <article class="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Last Updated</p>
                <p class="mt-3 text-lg font-medium text-white">{{ profile()!.updatedAt | date: 'medium' }}</p>
              </article>
            </section>

            @if (profile()!.headline || profile()!.nickname) {
              <section class="grid gap-6 md:grid-cols-2">
                @if (profile()!.headline) {
                  <article class="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Headline</p>
                    <p class="mt-3 text-lg font-medium text-white">{{ profile()!.headline }}</p>
                  </article>
                }
<!-- 
                @if (profile()!.nickname) {
                  <article class="rounded-3xl border border-white/10 bg-zinc-900/80 p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Nickname</p>
                    <p class="mt-3 text-lg font-medium text-white">{{ profile()!.nickname }}</p>
                  </article>
                } -->
              </section>
            }
          }
        }
      </div>
    </div>
  `,
  
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
    return profileImageUrl(profileData?.image, this.profileBaseUrl, '/assets/avatar.png');
  }
}
