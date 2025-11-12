import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../env/env';
import { AuthStateService } from '../../core/services/state/auth-state.service';
import { UpdateProfileRequest } from '../../core/services/interfaces/auth.interface';

@Component({
  selector: 'app-profile-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white">
      <div class="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold">Edit Profile</h1>
            <p class="text-zinc-400 mt-1">Update your personal information and display details</p>
          </div>

          <a
            routerLink="/profile"
            class="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            ← Back to profile
          </a>
        </header>

        @if (!isLoggedIn()) {
          <div class="rounded-xl border border-white/10 bg-red-500/10 p-6 text-red-200">
            <h2 class="text-xl font-semibold mb-2">You are not signed in</h2>
            <p class="text-sm">Please log in to edit your profile.</p>
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
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
              <section class="rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-md p-6 shadow-lg shadow-black/30">
                <h2 class="text-xl font-semibold mb-4">Profile Picture</h2>

                <div class="flex flex-col sm:flex-row gap-6 sm:items-center">
                  <img
                    [src]="previewUrl() || avatarUrl()"
                    alt="Profile preview"
                    class="h-28 w-28 rounded-full border-4 border-white/10 object-cover shadow-lg"
                  />

                  <div class="space-y-3">
                    <label class="inline-flex items-center justify-center rounded-full bg-linear-to-r from-zinc-700 via-zinc-600 to-zinc-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/40 transition duration-300 hover:-translate-y-0.5 hover:from-zinc-600 hover:to-zinc-400 hover:shadow-[0_0_25px_rgba(255,255,255,0.12)] cursor-pointer">
                      <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)" />
                      Choose new image
                    </label>

                    @if (selectedFile()) {
                      <button type="button" class="text-xs text-zinc-400 hover:text-zinc-200 transition" (click)="clearSelectedFile()">
                        Remove selected image
                      </button>
                    }

                    <p class="text-xs text-zinc-500">Recommended square image (PNG, JPG, or WEBP) up to 2MB.</p>
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-md p-6 shadow-lg shadow-black/30 space-y-5">
                <div class="grid gap-5 md:grid-cols-2">
                  <label class="flex flex-col gap-1 text-sm">
                    <span class="text-zinc-300">Username</span>
                    <input
                      type="text"
                      formControlName="username"
                      class="rounded border border-white/10 bg-zinc-900/60 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="abdo_Atef"
                    />
                    @if (form.controls.username.invalid && (form.controls.username.touched || form.controls.username.dirty)) {
                      <span class="text-xs text-red-300">Username is required (min 3 characters).</span>
                    }
                  </label>

                  <label class="flex flex-col gap-1 text-sm">
                    <span class="text-zinc-300">Email</span>
                    <input
                      type="email"
                      formControlName="email"
                      class="rounded border border-white/10 bg-zinc-900/60 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="abdo@example.com"
                    />
                    @if (form.controls.email.invalid && (form.controls.email.touched || form.controls.email.dirty)) {
                      <span class="text-xs text-red-300">Please enter a valid email address.</span>
                    }
                  </label>
                </div>

                <div class="grid gap-5 md:grid-cols-2">
                  <label class="flex flex-col gap-1 text-sm">
                    <span class="text-zinc-300">Nickname</span>
                    <input
                      type="text"
                      formControlName="nickname"
                      class="rounded border border-white/10 bg-zinc-900/60 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="Abdo Atef"
                    />
                  </label>

                  <label class="flex flex-col gap-1 text-sm">
                    <span class="text-zinc-300">Phone</span>
                    <input
                      type="tel"
                      formControlName="phone"
                      class="rounded border border-white/10 bg-zinc-900/60 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                      placeholder="+201009972926"
                    />
                  </label>
                </div>

                <label class="flex flex-col gap-1 text-sm">
                  <span class="text-zinc-300">Headline</span>
                  <input
                    type="text"
                    formControlName="headline"
                    class="rounded border border-white/10 bg-zinc-900/60 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Frontend Web Developer | Angular Enthusiast"
                  />
                </label>
              </section>

              @if (errorMessage()) {
                <div class="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {{ errorMessage() }}
                </div>
              }

              @if (successMessage()) {
                <div class="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  {{ successMessage() }}
                </div>
              }

              <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="submit"
                  class="inline-flex items-center justify-center rounded-full bg-linear-to-r from-emerald-600 to-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition duration-300 hover:-translate-y-0.5 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
                  [disabled]="form.invalid || isSubmitting()"
                >
                  @if (isSubmitting()) {
                    <span class="flex items-center gap-2">
                      <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Saving changes...
                    </span>
                  } @else {
                    Save changes
                  }
                </button>

                <a routerLink="/profile" class="text-sm text-zinc-400 hover:text-zinc-200 transition">Cancel and go back</a>
              </div>
            </form>
          }
        }
      </div>
    </div>
  `,
})
export class ProfileEditPageComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _authState = inject(AuthStateService);
  private readonly _router = inject(Router);

  readonly profile = this._authState.profile;
  readonly isLoggedIn = this._authState.isLoggedIn;

  private readonly profileBaseUrl = environment.profile;

  readonly form = this._fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    nickname: [''],
    phone: [''],
    headline: [''],
  });

  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly uploadedImage = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly isUploadingImage = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly avatarUrl = computed(() => this.buildAvatarUrl());

  private readonly _syncProfileEffect = effect(() => {
    const profile = this.profile();

    if (profile) {
      this.form.patchValue(
        {
          username: profile.username ?? '',
          email: profile.email ?? '',
          nickname: profile.nickname ?? '',
          phone: profile.phone ?? '',
          headline: profile.headline ?? '',
        },
        { emitEvent: false }
      );

      if (!this.selectedFile()) {
        this.previewUrl.set(null);
      }
    }
  });

  ngOnInit(): void {
    if (!this.isLoggedIn()) {
      return;
    }

    if (!this.profile()) {
      this._authState.getProfile();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;

    if (!input?.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);

    this.isUploadingImage.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this._authState
      .uploadProfileImage(file)
      .pipe(finalize(() => this.isUploadingImage.set(false)))
      .subscribe({
        next: (uploadRes) => {
          const imageValue = uploadRes.filename || uploadRes.url || null;
          if (imageValue) {
            this.uploadedImage.set(imageValue);
          }
        },
        error: (error) => {
          const message = error?.error?.message;
          this.errorMessage.set(
            Array.isArray(message)
              ? message.join(', ')
              : message || 'Failed to upload image. Please try again.'
          );
          this.selectedFile.set(null);
          this.previewUrl.set(null);
          this.uploadedImage.set(null);
        },
      });
  }

  clearSelectedFile() {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.uploadedImage.set(null);
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isUploadingImage()) {
      this.errorMessage.set('Please wait until the image upload completes.');
      return;
    }

    const profile = this.profile();

    if (!profile) {
      this.errorMessage.set('Profile data is not loaded yet. Please try again.');
      return;
    }

    const { username, email, nickname, phone, headline } = this.form.getRawValue();

    const payload: UpdateProfileRequest = {
      username: username.trim(),
      email: email.trim(),
      nickname: nickname?.trim() || null,
      phone: phone?.trim() || null,
      headline: headline?.trim() || null,
    };

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const imageValue = this.uploadedImage() ?? profile.image ?? null;

    this._authState
      .updateProfile({ ...payload, image: imageValue })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (updatedProfile) => {
          this.successMessage.set('Profile updated successfully.');
          this.selectedFile.set(null);
          this.previewUrl.set(null);
          this.uploadedImage.set(null);

          // Navigate back after a short delay for UX feedback
          setTimeout(() => {
            this._router.navigate(['/profile']);
          }, 800);
        },
        error: (error) => {
          const message = error?.error?.message;
          this.errorMessage.set(
            Array.isArray(message)
              ? message.join(', ')
              : message || 'Failed to update profile. Please try again.'
          );
        },
      });
  }

  private buildAvatarUrl(): string {
    const profile = this.profile();

    if (!profile?.image) {
      return '/assets/avatar.png';
    }

    if (profile.image.startsWith('http://') || profile.image.startsWith('https://')) {
      return profile.image;
    }

    let imagePath = profile.image.replace(/^https?:\/\/[^\/]+/, '');

    if (!imagePath.startsWith('/')) {
      return this.profileBaseUrl + imagePath;
    }

    if (imagePath.startsWith('/uploads/profile/')) {
      return 'http://localhost:3000' + imagePath;
    }

    return this.profileBaseUrl + imagePath;
  }
}
