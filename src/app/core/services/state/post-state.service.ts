import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../env/env';
import { catchError, finalize, tap, of } from 'rxjs';
import {
  IPost,
  IPostFeedResponse,
  IPostListResponse,
  IPostsQueryParams,
  IPostsFeedQueryParams,
  IPostsState,
} from '../interfaces/posts.interface';

@Injectable({
  providedIn: 'root',
})
export class PostStateService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // ============ State Signals ============
  private readonly _posts = signal<IPost[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _total = signal<number>(0);
  private readonly _currentPage = signal<number>(1);
  private readonly _totalPages = signal<number>(0);
  private readonly _limit = signal<number>(20);
  private readonly _hasMore = signal<boolean>(false);

  // Query parameters state
  private readonly _queryParams = signal<IPostsQueryParams>({
    page: 1,
    limit: 20,
    orderBy: 'createdAt',
    order: 'desc',
  });

  // ============ Public Computed Signals ============
  readonly posts = computed(() => this._posts());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly total = computed(() => this._total());
  readonly currentPage = computed(() => this._currentPage());
  readonly totalPages = computed(() => this._totalPages());
  readonly limit = computed(() => this._limit());
  readonly hasMore = computed(() => this._hasMore());
  readonly queryParams = computed(() => this._queryParams());

  // Complete state object
  readonly state = computed<IPostsState>(() => ({
    posts: this._posts(),
    loading: this._loading(),
    error: this._error(),
    total: this._total(),
    currentPage: this._currentPage(),
    totalPages: this._totalPages(),
    limit: this._limit(),
    hasMore: this._hasMore(),
  }));

  // ============ Main Methods ============

  /**
   * Load posts with search/filter/sort parameters
   */
  loadPosts(params?: Partial<IPostsQueryParams>) {
    // Merge with existing params
    const queryParams: IPostsQueryParams = {
      ...this._queryParams(),
      ...params,
    };

    // Update query params state
    this._queryParams.set(queryParams);

    // Build HTTP params - only add if value exists and is valid
    let httpParams = new HttpParams();
    
    // Ensure page and limit are valid integers
    const pageNum = queryParams.page ? Number(queryParams.page) : 1;
    const limitNum = queryParams.limit ? Number(queryParams.limit) : 20;
    
    const page = !isNaN(pageNum) && Number.isInteger(pageNum) && pageNum >= 1 
      ? Math.floor(pageNum)
      : 1;
    const limit = !isNaN(limitNum) && Number.isInteger(limitNum) && limitNum >= 1 && limitNum <= 100
      ? Math.floor(limitNum)
      : 20;
    
    // HttpParams.set() accepts strings, but backend expects integers
    // We need to ensure the values are proper integers before converting to string
    httpParams = httpParams.set('page', String(page));
    httpParams = httpParams.set('limit', String(limit));
    
    if (queryParams.orderBy) {
      httpParams = httpParams.set('orderBy', queryParams.orderBy);
    }
    if (queryParams.order) {
      httpParams = httpParams.set('order', queryParams.order);
    }
    if (queryParams.q && queryParams.q.trim()) {
      httpParams = httpParams.set('q', queryParams.q.trim());
    }
    if (queryParams.tags && queryParams.tags.trim()) {
      httpParams = httpParams.set('tags', queryParams.tags.trim());
    }
    if (queryParams.authorId) {
      const authorIdNum = Number(queryParams.authorId);
      if (!isNaN(authorIdNum) && Number.isInteger(authorIdNum)) {
        httpParams = httpParams.set('authorId', authorIdNum);
      }
    }

    // Set loading state
    this._loading.set(true);
    this._error.set(null);

    // Make HTTP request
    this.http
      .get<IPostListResponse>(`${this.baseUrl}/posts`, { params: httpParams })
      .pipe(
        tap((response) => {
          this._posts.set(response.items);
          this._total.set(response.meta.total);
          this._currentPage.set(response.meta.page);
          this._totalPages.set(response.meta.totalPages);
          this._limit.set(response.meta.limit);
          // Calculate hasMore for consistency
          this._hasMore.set(response.meta.page < response.meta.totalPages);
        }),
        catchError((error) => {
          const errorMessage = error?.error?.message 
            ? (Array.isArray(error.error.message) ? error.error.message.join(', ') : error.error.message)
            : 'Failed to load posts';
          this._error.set(errorMessage);
          console.error('Error loading posts:', error);
          return of({ items: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
        }),
        finalize(() => this._loading.set(false))
      )
      .subscribe();
  }

  /**
   * Load posts feed with offset-based pagination
   */
  loadFeed(params?: Partial<IPostsFeedQueryParams>) {
    const queryParams: IPostsFeedQueryParams = {
      offset: params?.offset ?? 0,
      limit: params?.limit ?? 20,
    };

    let httpParams = new HttpParams();
    httpParams = httpParams.set('offset', queryParams.offset!.toString());
    httpParams = httpParams.set('limit', queryParams.limit!.toString());

    this._loading.set(true);
    this._error.set(null);

    this.http
      .get<IPostFeedResponse>(`${this.baseUrl}/posts/feed`, { params: httpParams })
      .pipe(
        tap((response) => {
          this._posts.set(response.items);
          this._total.set(response.meta.total);
          this._limit.set(response.meta.limit);
          this._hasMore.set(response.meta.hasMore);
        }),
        catchError((error) => {
          this._error.set(error?.error?.message || 'Failed to load feed');
          console.error('Error loading feed:', error);
          return of({ items: [], meta: { total: 0, offset: 0, limit: 20, hasMore: false } });
        }),
        finalize(() => this._loading.set(false))
      )
      .subscribe();
  }

  /**
   * Load more posts (append to existing)
   */
  loadMore() {
    const currentOffset = this._posts().length;
    const queryParams: IPostsFeedQueryParams = {
      offset: currentOffset,
      limit: this._limit(),
    };

    let httpParams = new HttpParams();
    httpParams = httpParams.set('offset', queryParams.offset!.toString());
    httpParams = httpParams.set('limit', queryParams.limit!.toString());

    this._loading.set(true);

    this.http
      .get<IPostFeedResponse>(`${this.baseUrl}/posts/feed`, { params: httpParams })
      .pipe(
        tap((response) => {
          // Append new posts to existing
          this._posts.update((current) => [...current, ...response.items]);
          this._total.set(response.meta.total);
          this._hasMore.set(response.meta.hasMore);
        }),
        catchError((error) => {
          this._error.set(error?.error?.message || 'Failed to load more posts');
          console.error('Error loading more posts:', error);
          return of({ items: [], meta: { total: 0, offset: 0, limit: 20, hasMore: false } });
        }),
        finalize(() => this._loading.set(false))
      )
      .subscribe();
  }

  /**
   * Get single post by slug
   */
  getPostBySlug(slug: string) {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<IPost>(`${this.baseUrl}/posts/${slug}`).pipe(
      catchError((error) => {
        this._error.set(error?.error?.message || 'Failed to load post');
        console.error('Error loading post:', error);
        throw error;
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Search posts
   */
  search(query: string) {
    this.loadPosts({ 
      q: query, 
      page: 1,
      limit: this._limit() || 20
    });
  }

  /**
   * Filter by tags
   */
  filterByTags(tags: string[]) {
    this.loadPosts({ 
      tags: tags.join(','), 
      page: 1,
      limit: this._limit() || 20
    });
  }

  /**
   * Filter by author
   */
  filterByAuthor(authorId: number) {
    this.loadPosts({ 
      authorId, 
      page: 1,
      limit: this._limit() || 20
    });
  }

  /**
   * Sort posts
   */
  sortBy(orderBy: 'createdAt' | 'updatedAt' | 'title', order: 'asc' | 'desc' = 'desc') {
    this.loadPosts({ orderBy, order });
  }

  /**
   * Go to specific page
   */
  goToPage(page: number) {
    this.loadPosts({ page });
  }

  /**
   * Change page size
   */
  changePageSize(limit: number) {
    this.loadPosts({ limit, page: 1 });
  }

  /**
   * Reset filters
   */
  resetFilters() {
    this._queryParams.set({
      page: 1,
      limit: 20,
      orderBy: 'createdAt',
      order: 'desc',
    });
    this.loadPosts();
  }

  /**
   * Clear all posts
   */
  clear() {
    this._posts.set([]);
    this._total.set(0);
    this._currentPage.set(1);
    this._totalPages.set(0);
    this._hasMore.set(false);
    this._error.set(null);
  }

  // ============ CRUD Operations ============

  /**
   * Create a new post
   */
  createPost(postData: { slug: string; title: string; content: string; coverImage?: string; tags?: string[] }) {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<IPost>(`${this.baseUrl}/posts`, postData).pipe(
      tap((newPost) => {
        // Add new post to the beginning of the list
        this._posts.update((posts) => [newPost, ...posts]);
        this._total.update((total) => total + 1);
      }),
      catchError((error) => {
        const errorMessage = error?.error?.message
          ? Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message
          : 'Failed to create post';
        this._error.set(errorMessage);
        console.error('Error creating post:', error);
        throw error;
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Update an existing post
   */
  updatePost(id: number, postData: Partial<{ slug: string; title: string; content: string; coverImage?: string; tags?: string[] }>) {
    this._loading.set(true);
    this._error.set(null);

    return this.http.patch<IPost>(`${this.baseUrl}/posts/${id}`, postData).pipe(
      tap((updatedPost) => {
        // Update post in the list
        this._posts.update((posts) =>
          posts.map((post) => (post.id === id ? updatedPost : post))
        );
      }),
      catchError((error) => {
        const errorMessage = error?.error?.message
          ? Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message
          : 'Failed to update post';
        this._error.set(errorMessage);
        console.error('Error updating post:', error);
        throw error;
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Delete a post
   */
  deletePost(id: number) {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<IPost>(`${this.baseUrl}/posts/${id}`).pipe(
      tap(() => {
        // Remove post from the list
        this._posts.update((posts) => posts.filter((post) => post.id !== id));
        this._total.update((total) => Math.max(0, total - 1));
      }),
      catchError((error) => {
        const errorMessage = error?.error?.message
          ? Array.isArray(error.error.message)
            ? error.error.message.join(', ')
            : error.error.message
          : 'Failed to delete post';
        this._error.set(errorMessage);
        console.error('Error deleting post:', error);
        throw error;
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Load posts by current user (for private feed)
   */
  loadMyPosts(userId: number, params?: Partial<IPostsQueryParams>) {
    this.loadPosts({
      ...params,
      authorId: userId,
    });
  }

  // ============ Backward Compatibility ============
  /**
   * @deprecated Use loadFeed() instead
   */
  getAllFeeds() {
    this.loadFeed({ offset: 0, limit: 10 });
  }
}
