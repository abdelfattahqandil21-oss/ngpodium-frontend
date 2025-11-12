import { Component, inject, OnInit, signal, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PostStateService } from '../../core/services/state/post-state.service';
import { AuthStateService } from '../../core/services/state/auth-state.service';
import { environment } from '../../../env/env';
import { IPost } from '../../core/services/interfaces/posts.interface';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import jsonLang from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import csharp from 'highlight.js/lib/languages/csharp';
import java from 'highlight.js/lib/languages/java';
import ruby from 'highlight.js/lib/languages/ruby';


hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('json', jsonLang);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp);
hljs.registerLanguage('java', java);
hljs.registerLanguage('ruby', ruby);


@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <div class="min-h-screen bg-zinc-950 text-white">
      <!-- Loading State -->
      @if (postState.loading() && !post()) {
        <div class="flex justify-center items-center py-20">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      <!-- Error State -->
      @if (postState.error()) {
        <div class="container mx-auto px-4 py-8">
          <div class="p-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            <p class="font-semibold mb-2">Error loading post</p>
            <p class="text-sm">{{ postState.error() }}</p>
            <button 
              (click)="goBack()"
              class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      }

      <!-- Post Content -->
      @if (post() && !postState.error()) {
        <article class="container mx-auto px-4 py-8 max-w-4xl">
          <!-- Cover Image -->
          @if (post()!.coverImage) {
            <div class="mb-8 rounded-xl overflow-hidden">
              <img 
                [src]="getCoverImageUrl(post()!.coverImage)" 
                [alt]="post()!.title"
                class="w-full h-96 object-cover"
              />
            </div>
          }

          <!-- Header -->
          <header class="mb-8">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">{{ post()!.title }}</h1>
            
            <!-- Meta -->
            <div class="flex items-center gap-4 text-zinc-400 mb-6">
              <div class="flex items-center gap-2">
                <img 
                  [src]="getProfileImageUrl(post()!.author.image)" 
                  [alt]="post()!.author.username"
                  class="w-10 h-10 rounded-full"
                />
                <div>
                  <p class="text-white font-semibold">{{ post()!.author.username }}</p>
                  <p class="text-sm">{{ post()!.createdAt | date: 'MMM d, y' }}</p>
                </div>
              </div>
              
              @if (isOwner()) {
                <div class="ml-auto flex gap-3">
                  <a 
                    [routerLink]="['/post', post()!.slug, 'edit']"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-zinc-700 via-zinc-600 to-zinc-500 text-white rounded-lg hover:from-zinc-600 hover:to-zinc-400 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Edit
                  </a>
                  <button 
                    (click)="deletePost()"
                    class="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                    Delete
                  </button>
                </div>
              }
            </div>

            <!-- Tags -->
            @if (post()!.tags && post()!.tags.length > 0) {
              <div class="flex flex-wrap gap-2">
                @for (tag of post()!.tags; track tag) {
                  <span class="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">
                    #{{ tag }}
                  </span>
                }
              </div>
            }
          </header>

          <!-- Content -->
          <div 
            #postContent
            class="prose prose-invert prose-lg max-w-none"
            [innerHTML]="post()!.content"
          ></div>

          <!-- Footer -->
          <footer class="mt-12 pt-8 border-t border-zinc-800">
            <div class="flex items-center justify-between">
              <button 
                (click)="goBack()"
                class="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition-colors"
              >
                ← Back
              </button>
              
              <div class="text-sm text-zinc-500">
                Last updated: {{ post()!.updatedAt | date: 'medium' }}
              </div>
            </div>
          </footer>
        </article>
      }
    </div>
  `,
  styles: [`
    :host ::ng-deep .prose {
      color: #e4e4e7;
    }

    :host ::ng-deep .prose h1,
    :host ::ng-deep .prose h2,
    :host ::ng-deep .prose h3 {
      color: #f4f4f5;
    }

    :host ::ng-deep .prose a {
      color: #60a5fa;
      text-decoration: underline;
    }

    :host ::ng-deep .prose code {
      background: #27272a;
      color: #fbbf24;
      padding: 2px 6px;
      border-radius: 3px;
    }

    :host ::ng-deep .prose pre {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 12px 30px -12px rgba(0, 0, 0, 0.7);
    }

    :host ::ng-deep .prose pre code.hljs {
      display: block;
      padding: 1.25rem;
      background: #1e1e1e;
      color: #d4d4d4;
      border-radius: 8px;
      font-family: 'Fira Code', 'JetBrains Mono', 'Courier New', monospace;
      font-size: 0.95rem;
      line-height: 1.65;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    :host ::ng-deep .prose pre code.hljs::-webkit-scrollbar {
      height: 8px;
    }

    :host ::ng-deep .prose pre code.hljs::-webkit-scrollbar-thumb {
      background: rgba(244, 244, 245, 0.12);
      border-radius: 999px;
    }

    :host ::ng-deep .prose pre code .hljs-keyword,
    :host ::ng-deep .prose pre code .hljs-selector-tag,
    :host ::ng-deep .prose pre code .hljs-subst {
      color: #569cd6;
    }

    :host ::ng-deep .prose pre code .hljs-number,
    :host ::ng-deep .prose pre code .hljs-literal,
    :host ::ng-deep .prose pre code .hljs-variable,
    :host ::ng-deep .prose pre code .hljs-template-variable {
      color: #b5cea8;
    }

    :host ::ng-deep .prose pre code .hljs-string,
    :host ::ng-deep .prose pre code .hljs-doctag {
      color: #ce9178;
    }

    :host ::ng-deep .prose pre code .hljs-title,
    :host ::ng-deep .prose pre code .hljs-section {
      color: #dcdcaa;
    }

    :host ::ng-deep .prose pre code .hljs-comment,
    :host ::ng-deep .prose pre code .hljs-quote {
      color: #6a9955;
      font-style: italic;
    }

    :host ::ng-deep .prose pre code .hljs-attr,
    :host ::ng-deep .prose pre code .hljs-attribute,
    :host ::ng-deep .prose pre code .hljs-selector-id,
    :host ::ng-deep .prose pre code .hljs-selector-class {
      color: #9cdcfe;
    }

    :host ::ng-deep .prose pre code .hljs-built_in,
    :host ::ng-deep .prose pre code .hljs-builtin-name,
    :host ::ng-deep .prose pre code .hljs-selector-attr,
    :host ::ng-deep .prose pre code .hljs-selector-pseudo {
      color: #c586c0;
    }

    :host ::ng-deep .prose pre code .hljs-meta {
      color: #d4d4d4;
    }

    :host ::ng-deep .prose pre code .hljs-symbol,
    :host ::ng-deep .prose pre code .hljs-name,
    :host ::ng-deep .prose pre code .hljs-bullet {
      color: #d7ba7d;
    }

    :host ::ng-deep .prose pre code .hljs-link {
      text-decoration: underline;
    }

    :host ::ng-deep .prose img {
      border-radius: 8px;
      margin: 1.5rem 0;
    }
  `]
})
export class PostDetailComponent implements OnInit, AfterViewChecked {
  readonly postState = inject(PostStateService);
  readonly authState = inject(AuthStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly imgcovered = environment.coverImg;
  readonly profileImg = environment.profile;
  readonly demoImg = 'assets/avatar.png';
  readonly post = signal<IPost | null>(null);
  private highlightApplied = false;
  private highlightRetryCount = 0;
  @ViewChild('postContent') postContent?: ElementRef<HTMLElement>;

  ngOnInit() {
    // Load user profile if not loaded
    console.log('Current profile on init:', this.authState.profile());
    if (!this.authState.profile()) {
      console.log('Loading profile...');
      this.authState.getProfile();
    }
    
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadPost(slug);
    }
  }

  loadPost(slug: string) {
    this.postState.getPostBySlug(slug).subscribe({
      next: (post) => {
        console.log('Post loaded:', post);
        console.log('Post author:', post.author);
        this.post.set(post);
        this.highlightApplied = false;
        this.highlightRetryCount = 0;

        // Check ownership after post is loaded
        setTimeout(() => {
          console.log('Checking ownership after load...');
          console.log('isOwner result:', this.isOwner());
        }, 100);

        this.scheduleHighlightRetry();
      },
      error: (error) => {
        console.error('Error loading post:', error);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (!this.highlightApplied && this.post()) {
      this.scheduleHighlightRetry();
    }
  }

  private applySyntaxHighlighting(): void {
    const contentElement = this.postContent?.nativeElement;
    if (!contentElement) {
      return;
    }

    const codeBlocks = contentElement.querySelectorAll('pre code');
    if (!codeBlocks.length) {
      return;
    }

    requestAnimationFrame(() => {
      codeBlocks.forEach((block) => {
        const element = block as HTMLElement;
        hljs.highlightElement(element);
      });

      this.highlightApplied = true;
      this.highlightRetryCount = 0;
    });
  }

  private scheduleHighlightRetry(): void {
    if (this.highlightApplied || this.highlightRetryCount >= 5) {
      return;
    }

    this.highlightRetryCount += 1;
    setTimeout(() => this.applySyntaxHighlighting(), 50);
  }

  isOwner(): boolean {
    const currentUser = this.authState.profile();
    const postAuthor = this.post()?.author;
    const isOwner = !!(currentUser && postAuthor && currentUser.id === postAuthor.id);
    
    console.log('isOwner check:', {
      currentUserId: currentUser?.id,
      postAuthorId: postAuthor?.id,
      isOwner: isOwner
    });
    
    return isOwner;
  }

  deletePost() {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    const postId = this.post()?.id;
    if (!postId) return;

    this.postState.deletePost(postId).subscribe({
      next: () => {
        console.log('Post deleted successfully!');
        this.router.navigate(['/my-posts']);
      },
      error: (error) => {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  /**
   * Get full cover image URL with smart path handling
   */
  getCoverImageUrl(coverImage: string | null): string {
    if (!coverImage) {
      return this.demoImg;
    }

    let imagePath = coverImage;
    
    // Remove any base URL if present
    imagePath = imagePath.replace(/^https?:\/\/[^\/]+/, '');
    
    if (!imagePath.startsWith('/')) {
      // Just filename: image.webp
      return this.imgcovered + imagePath;
    } else if (imagePath.startsWith('/uploads/cover/')) {
      // Full path: /uploads/cover/image.webp
      return 'http://localhost:3000' + imagePath;
    } else {
      // Other path
      return this.imgcovered + imagePath;
    }
  }

  /**
   * Get full profile image URL with smart path handling
   */
  getProfileImageUrl(image: string | null): string {
    if (!image) {
      return this.demoImg;
    }

    let imagePath = image;
    
    // Remove any base URL if present
    imagePath = imagePath.replace(/^https?:\/\/[^\/]+/, '');
    
    if (!imagePath.startsWith('/')) {
      // Just filename: user.webp
      return this.profileImg + imagePath;
    } else if (imagePath.startsWith('/uploads/profile/')) {
      // Full path: /uploads/profile/user.webp
      return 'http://localhost:3000' + imagePath;
    } else {
      // Other path
      return this.profileImg + imagePath;
    }
  }

}
