import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewChild,
  signal,
  effect,
  DestroyRef,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { RichEditorComponent } from './rich-editor.component';
import { PostStateService } from '../core/services/state/post-state.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/env';
import { map } from 'rxjs/operators';
import { IPost } from '../core/services/interfaces/posts.interface';

@Component({
  selector: 'app-write-post-page',
  imports: [ReactiveFormsModule, CommonModule, RichEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <div class="content-wrapper">
        <!-- Header -->
        <header class="page-header">
          <h1 class="page-title">
            {{ isEditMode() ? 'Edit Post' : 'Create New Post' }}
          </h1>
          <button
            type="button"
            class="close-btn"
            (click)="handleCancel()"
            aria-label="Close">
            ✕
          </button>
        </header>

        <!-- Form -->
        <form [formGroup]="postForm" (ngSubmit)="handleSubmit()" class="post-form">
          <!-- Title Input -->
          <div class="form-group">
            <label for="title" class="form-label">Title *</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              class="form-input"
              placeholder="Enter post title"
              [class.error]="showError('title')"
            />
            @if (showError('title')) {
              <span class="error-message">
                {{ getErrorMessage('title') }}
              </span>
            }
          </div>

          <!-- Rich Editor -->
          <div class="form-group">
            <label class="form-label">Content *</label>
            <app-rich-editor
              #richEditor
              [initialContent]="initialContent()"
              [placeholder]="'Write your post content...'"
              (contentChange)="onContentChange($event)">
            </app-rich-editor>
            @if (showError('content')) {
              <span class="error-message">
                {{ getErrorMessage('content') }}
              </span>
            }
          </div>

          <!-- Cover Image -->
          <div class="form-group">
            <label class="form-label">Cover Image</label>
            <div class="image-upload-container">
              @if (previewUrl()) {
                <div class="image-preview-wrapper">
                  <img
                    [src]="previewUrl()"
                    alt="Cover preview"
                    class="image-preview"
                  />
                  <button
                    type="button"
                    class="remove-image-btn"
                    (click)="removeCoverImage()">
                    Remove Image
                  </button>
                </div>
              } @else {
                <label class="file-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    (change)="onFileSelected($event)"
                    class="file-input"
                  />
                  <span class="upload-text">
                    <i class="pi pi-images"></i>
                     Choose cover image
                  </span>
                </label>
              }
            </div>
          </div>

          <!-- Tags Input -->
          <div class="form-group">
            <label for="tags" class="form-label">Tags</label>
            <input
              id="tags"
              type="text"
              formControlName="tags"
              class="form-input"
              placeholder="angular, typescript, web-development"
            />
            <span class="help-text">Separate tags with commas</span>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="handleCancel()">
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isSubmitting()">
              @if (isSubmitting()) {
                <span class="spinner"></span>
                Saving...
              } @else {
                {{ isEditMode() ? 'Update Post' : 'Publish Post' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: #0c0c0f;
      color: #e4e4e7;
      padding: 24px;
    }

    .content-wrapper {
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      color: #f4f4f5;
      margin: 0;
    }

    .close-btn {
      background: none;
      border: none;
      color: #a1a1a1;
      font-size: 28px;
      cursor: pointer;
      padding: 4px 8px;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #fff;
    }

    .post-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-size: 14px;
      font-weight: 500;
      color: #d4d4d8;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      background: #18181b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #e4e4e7;
      font-size: 16px;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #4a9eff;
    }

    .form-input.error {
      border-color: #ef4444;
    }

    .error-message {
      font-size: 13px;
      color: #ef4444;
    }

    .help-text {
      font-size: 13px;
      color: #71717a;
    }

    .image-upload-container {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.2);
      padding: 16px;
    }

    .file-upload-label {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .file-upload-label:hover {
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.05);
    }

    .file-input {
      display: none;
    }

    .upload-text {
      font-size: 14px;
      color: #d4d4d8;
    }

    .image-preview-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .image-preview {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .remove-image-btn {
      align-self: flex-start;
      padding: 8px 16px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #d4d4d8;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .remove-image-btn:hover {
      background: #27272a;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn {
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #d4d4d8;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #27272a;
    }

    .btn-primary {
      background: rgba(255, 255, 255, 0.9);
      border: none;
      color: #0c0c0f;
    }

    .btn-primary:hover:not(:disabled) {
      background: #fff;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-top-color: #0c0c0f;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }

      .page-title {
        font-size: 1.5rem;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `],
})
export class WritePostPageComponent {
  @ViewChild('richEditor') richEditor?: RichEditorComponent;

  private readonly fb = inject(FormBuilder);
  private readonly postState = inject(PostStateService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly baseUrl = environment.apiUrl;

  // Signals
  readonly previewUrl = signal<string | null>(null);
  readonly isEditMode = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly initialContent = signal<string>('');
  private readonly editingPostId = signal<number | null>(null);
  private readonly editingSlug = signal<string | null>(null);

  // Form
  readonly postForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    coverImageData: [''],
    tags: [''],
  });

  constructor() {
    this.loadPostIfEditMode();
  }

  private loadPostIfEditMode(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) return of(null);
          
          this.isEditMode.set(true);
          return this.postState.getPostBySlug(slug);
        })
      )
      .subscribe((post: IPost | null) => {
        if (!post) return;

        this.editingPostId.set(post.id);
        this.editingSlug.set(post.slug);
        this.initialContent.set(post.content);

        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          tags: post.tags?.join(', ') || '',
        });

        if (post.coverImage) {
          const fullUrl = this.getFullImageUrl(post.coverImage, environment.coverImg);
          this.previewUrl.set(fullUrl);
        }
      });
  }

  onContentChange(content: string): void {
    this.postForm.controls.content.setValue(content);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.postForm.controls.coverImageData.setValue(dataUrl);
      this.previewUrl.set(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  removeCoverImage(): void {
    this.postForm.controls.coverImageData.setValue('');
    this.previewUrl.set(null);
  }

  handleSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.postForm.markAllAsTouched();

    if (this.postForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.postForm.getRawValue();
    const tags = formValue.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const postData = {
      title: formValue.title,
      content: formValue.content,
      tags,
    };

    // Handle cover image upload if present
    if (formValue.coverImageData) {
      this.uploadCoverAndSavePost(formValue.coverImageData, postData);
    } else {
      this.savePost(postData);
    }
  }

  private uploadCoverAndSavePost(dataUrl: string, postData: any): void {
    this.dataUrlToFile(dataUrl, 'cover.png')
      .then(file => {
        const formData = new FormData();
        formData.append('file', file);

        this.http.post<{ url: string }>(`${this.baseUrl}/upload/cover`, formData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response) => {
              // Extract relative path (remove base URL if present)
              const coverImagePath = this.extractRelativePath(response.url);
              this.savePost({ ...postData, coverImage: coverImagePath });
            },
            error: () => {
              // Save without cover image on upload error
              this.savePost(postData);
            },
          });
      })
      .catch(() => {
        this.savePost(postData);
      });
  }

  private savePost(data: any): void {
    const postId = this.editingPostId();
    
    // Generate slug from title if creating new post
    if (!postId) {
      data.slug = this.generateSlug(data.title);
    }

    const action$ = postId
      ? this.postState.updatePost(postId, data)
      : this.postState.createPost(data);

    action$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (post) => {
          this.router.navigate(['/post', post.slug]);
        },
        error: (error: Error) => {
          console.error('Failed to save post:', error);
          alert('Failed to save post. Please try again.');
          this.isSubmitting.set(false);
        },
      });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Get full image URL with smart path handling
   */
  private getFullImageUrl(imagePath: string, baseUrl: string): string {
    // Remove any base URL if present
    let path = imagePath.replace(/^https?:\/\/[^\/]+/, '');
    
    if (!path.startsWith('/')) {
      // Just filename: image.webp
      return baseUrl + path;
    } else if (path.startsWith('/uploads/')) {
      // Full path: /uploads/cover/image.webp
      return 'http://localhost:3000' + path;
    } else {
      // Other path
      return baseUrl + path;
    }
  }

  handleCancel(): void {
    if (this.postForm.dirty) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    this.router.navigate(['/']);
  }

  showError(controlName: string): boolean {
    const control = this.postForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.postForm.get(controlName);
    if (!control?.errors) return '';

    if (control.errors['required']) {
      return 'This field is required';
    }
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    return 'Invalid value';
  }

  private dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
    return fetch(dataUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => new File([buffer], filename, { type: 'image/png' }));
  }

  /**
   * Extract relative path from URL
   * Removes base URL if present
   */
  private extractRelativePath(url: string): string {
    // Remove any base URL (localhost or production)
    return url.replace(/^https?:\/\/[^\/]+/, '');
  }
}
