import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PostStateService } from '../../core/services/state/post-state.service';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../env/env';

@Component({
  selector: 'app-feeds-global',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './feeds-global.component.html',
  styleUrls: ['./feeds-global.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class FeedsGlobalComponent implements OnInit, OnDestroy {
  readonly imgcovered = environment.coverImg;
  readonly profileImg = environment.profile;
  readonly demoImg = 'assets/avatar.png';
  readonly postState = inject(PostStateService);

  @ViewChild('infiniteSentinel') private sentinel?: ElementRef<HTMLDivElement>;
  private observer?: IntersectionObserver;

  private readonly paginationEffect = effect(() => {
    // اعتمد على state مش على ViewChild
    const loading = this.postState.loading();
    const hasMore = this.postState.hasMore();

    if (!loading && hasMore) {
      queueMicrotask(() => this.observeSentinel());
    }

    if (!hasMore) {
      queueMicrotask(() => this.teardownObserver());
    }
  });

  ngOnInit() {
    this.postState.loadFeed({ offset: 0, limit: 5 });
  }



  ngOnDestroy(): void {
    this.teardownObserver();
    this.paginationEffect.destroy();
  }

  /**
   * Load more posts
   */
  loadMore() {
    if (this.postState.hasMore() && !this.postState.loading()) {
      this.postState.loadMore();
    }
  }

  private observeSentinel(): void {
    if (!this.sentinel || this.observer) {
      return; // منع إعادة إنشاء observer
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        if (!this.postState.loading() && this.postState.hasMore()) {
          this.observer?.unobserve(this.sentinel!.nativeElement);
          this.loadMore();
        } else if (!this.postState.hasMore()) {
          this.teardownObserver();
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.1 }
    );

    this.observer.observe(this.sentinel.nativeElement);
  }

  private teardownObserver(): void {
    if (this.observer && this.sentinel) {
      this.observer.unobserve(this.sentinel.nativeElement);
    }
    this.observer?.disconnect();
    this.observer = undefined;
  }

  /**
   * Get full cover image URL
   */
  getCoverImageUrl(post: any): string {
    if (!post.coverImage) return this.demoImg;

    let imagePath = post.coverImage.replace(/^https?:\/\/[^\/]+/, '');
    let url: string;

    if (!imagePath.startsWith('/')) {
      url = this.imgcovered + imagePath;
    } else if (imagePath.startsWith('/uploads/cover/')) {
      url = 'http://localhost:3000' + imagePath;
    } else {
      url = this.imgcovered + imagePath;
    }

    return url;
  }

  /**
   * Get full profile image URL
   */
  getProfileImageUrl(author: any): string {
    if (!author.image) return this.demoImg;

    let imagePath = author.image.replace(/^https?:\/\/[^\/]+/, '');
    let url: string;

    if (!imagePath.startsWith('/')) {
      url = this.profileImg + imagePath;
    } else if (imagePath.startsWith('/uploads/profile/')) {
      url = 'http://localhost:3000' + imagePath;
    } else {
      url = this.profileImg + imagePath;
    }

    return url;
  }


  getContentPreview(content: string | null | undefined, limit = 220, fallback = ''): string {
    if (!content) {
      return fallback;
    }

    const text = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!text) {
      return fallback;
    }

    return text.length > limit ? text.slice(0, limit).trimEnd() + '...' : text;
  }
}

