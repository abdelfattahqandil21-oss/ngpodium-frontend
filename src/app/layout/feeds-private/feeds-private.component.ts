import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthStateService } from '../../core/services/state/auth-state.service';
import { PostStateService } from '../../core/services/state/post-state.service';
import { environment } from '../../../env/env';

@Component({
  selector: 'app-feeds-private',
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './feeds-private.component.html',
  styleUrl: './feeds-private.component.css',
})
export class FeedsPrivateComponent implements OnInit {
  readonly authState = inject(AuthStateService);
  readonly postState = inject(PostStateService);
  readonly imgcovered = environment.coverImg;
  readonly demoImg = 'assets/avatar.png';

  ngOnInit() {
    // Load user profile if not loaded
    const profile = this.authState.profile();
    if (!profile) {
      this.authState.getProfile();
    } else if (profile.id) {
      this.loadMyPosts();
    }
  }

  /**
   * Load current user's posts
   */
  loadMyPosts() {
    const userId = this.authState.profile()?.id;
    if (userId) {
      this.postState.loadMyPosts(userId, {
        page: 1,
        limit: 5,
        orderBy: 'createdAt',
        order: 'desc',
      });
    }
  }

  /**
   * Load more posts (infinite scroll)
   */
  loadMore() {
    if (this.postState.hasMore() && !this.postState.loading()) {
      this.postState.loadMore();
    }
  }

  /**
   * Delete a post
   */
  deletePost(postId: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postState.deletePost(postId).subscribe({
        next: () => {
          console.log('Post deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete post:', error);
        },
      });
    }
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

  getContentPreview(content: string | null | undefined, limit = 220, fallback = 'No content available'): string {
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
