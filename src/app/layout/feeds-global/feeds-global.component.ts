import { Component, inject, OnInit } from '@angular/core';
import { PostStateService } from '../../core/services/state/post-state.service';
import { DatePipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../env/env';

@Component({
  selector: 'app-feeds-global',
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './feeds-global.component.html',
  styleUrl: './feeds-global.component.css',
})
export class FeedsGlobalComponent implements OnInit {
  readonly imgcovered = environment.coverImg;
  readonly profileImg = environment.profile;
  readonly demoImg = 'assets/avatar.png';
  readonly postState = inject(PostStateService);

  ngOnInit() {
    // Load initial feed
    this.postState.loadFeed({ offset: 0, limit: 1 });
  }

  /**
   * Load more posts
   */
  loadMore() {
    if (this.postState.hasMore() && !this.postState.loading()) {
      this.postState.loadMore();
    }
  }

  /**
   * Debug helper - Get full cover image URL
   */
  getCoverImageUrl(post: any): string {
    if (!post.coverImage) {
      return this.demoImg;
    }

    let imagePath = post.coverImage;
    
    // Remove any base URL if present (e.g., http://localhost:3000)
    imagePath = imagePath.replace(/^https?:\/\/[^\/]+/, '');
    
    // If image is just a filename (no path), use imgcovered
    // If it already has /uploads/cover/, use base domain only
    let url: string;
    if (!imagePath.startsWith('/')) {
      // Just filename: image.webp
      url = this.imgcovered + imagePath;
    } else if (imagePath.startsWith('/uploads/cover/')) {
      // Full path: /uploads/cover/image.webp
      url = 'http://localhost:3000' + imagePath;
    } else {
      // Other path: /some/path/image.webp
      url = this.imgcovered + imagePath;
    }

    console.log('Cover Image Debug:', {
      postId: post.id,
      postTitle: post.title,
      originalPath: post.coverImage,
      cleanedPath: imagePath,
      baseUrl: this.imgcovered,
      fullUrl: url
    });
    
    return url;
  }

  /**
   * Debug helper - Get full profile image URL
   */
  getProfileImageUrl(author: any): string {
    if (!author.image) {
      return this.demoImg;
    }

    let imagePath = author.image;
    
    // Remove any base URL if present
    imagePath = imagePath.replace(/^https?:\/\/[^\/]+/, '');
    
    let url: string;
    if (!imagePath.startsWith('/')) {
      // Just filename: user.webp
      url = this.profileImg + imagePath;
    } else if (imagePath.startsWith('/uploads/profile/')) {
      // Full path: /uploads/profile/user.webp
      url = 'http://localhost:3000' + imagePath;
    } else {
      // Other path
      url = this.profileImg + imagePath;
    }

    console.log('Profile Image Debug:', {
      username: author.username,
      originalPath: author.image,
      cleanedPath: imagePath,
      baseUrl: this.profileImg,
      fullUrl: url
    });
    
    return url;
  }
}
