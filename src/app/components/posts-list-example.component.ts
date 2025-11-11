import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostStateService } from '../core/services/state/post-state.service';
import { environment } from '../../env/env';

/**
 * Example component showing how to use PostStateService
 * with search, filter, sort, and pagination
 */
@Component({
  selector: 'app-posts-list-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mx-auto p-4">
      <!-- Header with Search and Filters -->
      <div class="mb-6 space-y-4">
        <h1 class="text-3xl font-bold text-white">Posts</h1>

        <!-- Search Bar -->
        <div class="flex gap-2">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            placeholder="Search posts..."
            class="flex-1 px-4 py-2 bg-zinc-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          @if (searchQuery) {
            <button
              (click)="clearSearch()"
              class="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600"
            >
              Clear
            </button>
          }
        </div>

        <!-- Filters Row -->
        <div class="flex flex-wrap gap-4">
          <!-- Sort By -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-zinc-400">Sort by:</label>
            <select
              [(ngModel)]="sortField"
              (change)="onSortChange()"
              class="px-3 py-2 bg-zinc-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="title">Title</option>
            </select>
          </div>

          <!-- Sort Order -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-zinc-400">Order:</label>
            <select
              [(ngModel)]="sortOrder"
              (change)="onSortChange()"
              class="px-3 py-2 bg-zinc-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <!-- Page Size -->
          <div class="flex items-center gap-2">
            <label class="text-sm text-zinc-400">Per page:</label>
            <select
              [(ngModel)]="pageSize"
              (change)="onPageSizeChange()"
              class="px-3 py-2 bg-zinc-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

          <!-- Reset Button -->
          <button
            (click)="resetFilters()"
            class="px-4 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600"
          >
            Reset Filters
          </button>
        </div>

        <!-- Active Filters Info -->
        <div class="text-sm text-zinc-400">
          @if (postState.queryParams().q) {
            <span class="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded mr-2">
              Search: "{{ postState.queryParams().q }}"
            </span>
          }
          @if (postState.queryParams().tags) {
            <span class="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded mr-2">
              Tags: {{ postState.queryParams().tags }}
            </span>
          }
          @if (postState.queryParams().authorId) {
            <span class="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 rounded mr-2">
              Author ID: {{ postState.queryParams().authorId }}
            </span>
          }
        </div>
      </div>

      <!-- Loading State -->
      @if (postState.loading()) {
        <div class="flex justify-center items-center py-12">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="ml-3 text-zinc-400">Loading posts...</span>
        </div>
      }

      <!-- Error State -->
      @if (postState.error()) {
        <div class="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400">
          <p class="font-semibold">Error loading posts</p>
          <p class="text-sm">{{ postState.error() }}</p>
        </div>
      }

      <!-- Posts Grid -->
      @if (!postState.loading() && postState.posts().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (post of postState.posts(); track post.id) {
            <article class="bg-zinc-800/50 rounded-lg overflow-hidden hover:bg-zinc-800 transition-colors">
              <!-- Cover Image -->
              @if (post.coverImage) {
                <img
                  [src]="coverImg + post.coverImage"
                  [alt]="post.title"
                  class="w-full h-48 object-cover"
                />
              } @else {
                <div class="w-full h-48 bg-zinc-700 flex items-center justify-center">
                  <svg class="w-16 h-16 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              }

              <!-- Content -->
              <div class="p-4">
                <h2 class="text-xl font-bold text-white mb-2 line-clamp-2">
                  {{ post.title }}
                </h2>
                <p class="text-sm text-zinc-400 mb-3 line-clamp-3">
                  {{ post.content }}
                </p>

                <!-- Tags -->
                @if (post.tags && post.tags.length > 0) {
                  <div class="flex flex-wrap gap-2 mb-3">
                    @for (tag of post.tags.slice(0, 3); track tag) {
                      <span class="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded">
                        #{{ tag }}
                      </span>
                    }
                  </div>
                }

                <!-- Author & Date -->
                <div class="flex items-center justify-between text-xs text-zinc-500">
                  <div class="flex items-center gap-2">
                    @if (post.author.image) {
                      <img
                        [src]="post.author.image"
                        [alt]="post.author.username"
                        class="w-6 h-6 rounded-full"
                      />
                    }
                    <span>{{ post.author.nickname || post.author.username }}</span>
                  </div>
                  <span>{{ post.createdAt | date: 'short' }}</span>
                </div>
              </div>
            </article>
          }
        </div>

        <!-- Pagination -->
        <div class="mt-8 flex items-center justify-between">
          <div class="text-sm text-zinc-400">
            Showing {{ postState.posts().length }} posts
            @if (postState.total() > 0) {
              <span> of {{ postState.total() }} total</span>
            }
          </div>

          <div class="flex gap-2">
            <button
              (click)="previousPage()"
              [disabled]="postState.currentPage() === 1"
              class="px-4 py-2 bg-zinc-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700"
            >
              Previous
            </button>
            <span class="px-4 py-2 text-white">
              Page {{ postState.currentPage() }}
            </span>
            <button
              (click)="nextPage()"
              [disabled]="!postState.hasMore()"
              class="px-4 py-2 bg-zinc-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700"
            >
              Next
            </button>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!postState.loading() && postState.posts().length === 0 && !postState.error()) {
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-xl text-zinc-400 mb-2">No posts found</p>
          <p class="text-sm text-zinc-500">Try adjusting your search or filters</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class PostsListExampleComponent implements OnInit {
  readonly postState = inject(PostStateService);
  readonly coverImg = environment.coverImg;

  // Local filter state
  searchQuery = '';
  sortField: 'createdAt' | 'updatedAt' | 'title' = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';
  pageSize = 20;

  private searchTimeout?: number;

  ngOnInit() {
    // Load initial posts
    this.postState.loadPosts({
      page: 1,
      limit: this.pageSize,
      orderBy: this.sortField,
      order: this.sortOrder,
    });
  }

  /**
   * Handle search input with debounce
   */
  onSearchChange() {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout for debounce
    this.searchTimeout = window.setTimeout(() => {
      if (this.searchQuery.trim()) {
        this.postState.search(this.searchQuery.trim());
      } else {
        this.postState.loadPosts({
          page: 1,
          limit: this.pageSize,
          orderBy: this.sortField,
          order: this.sortOrder,
        });
      }
    }, 300);
  }

  /**
   * Clear search
   */
  clearSearch() {
    this.searchQuery = '';
    this.postState.loadPosts({
      page: 1,
      limit: this.pageSize,
      orderBy: this.sortField,
      order: this.sortOrder,
    });
  }

  /**
   * Handle sort change
   */
  onSortChange() {
    this.postState.sortBy(this.sortField, this.sortOrder);
  }

  /**
   * Handle page size change
   */
  onPageSizeChange() {
    this.postState.changePageSize(this.pageSize);
  }

  /**
   * Reset all filters
   */
  resetFilters() {
    this.searchQuery = '';
    this.sortField = 'createdAt';
    this.sortOrder = 'desc';
    this.pageSize = 20;
    this.postState.resetFilters();
  }

  /**
   * Go to previous page
   */
  previousPage() {
    const currentPage = this.postState.currentPage();
    if (currentPage > 1) {
      this.postState.goToPage(currentPage - 1);
    }
  }

  /**
   * Go to next page
   */
  nextPage() {
    if (this.postState.hasMore()) {
      this.postState.goToPage(this.postState.currentPage() + 1);
    }
  }
}
