# 📚 Posts State Service - Usage Guide

## Overview
الـ `PostStateService` هو service متقدم لإدارة حالة الـ posts باستخدام Angular Signals مع دعم كامل للـ search/filter/sort.

---

## 🎯 Features

- ✅ **Angular Signals** - Reactive state management
- ✅ **Search** - البحث في المحتوى، العنوان، Tags، والمؤلف
- ✅ **Filter** - فلترة بالـ tags والمؤلف
- ✅ **Sort** - ترتيب حسب التاريخ أو العنوان
- ✅ **Pagination** - دعم page-based و offset-based
- ✅ **Load More** - تحميل المزيد من المقالات
- ✅ **Error Handling** - معالجة الأخطاء بشكل احترافي
- ✅ **Loading States** - حالات التحميل

---

## 📖 Usage Examples

### 1. Basic Component Setup

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { PostStateService } from '@core/services/state/post-state.service';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  template: `
    <div class="posts-container">
      <!-- Loading State -->
      @if (postState.loading()) {
        <div class="loading">Loading posts...</div>
      }

      <!-- Error State -->
      @if (postState.error()) {
        <div class="error">{{ postState.error() }}</div>
      }

      <!-- Posts List -->
      @if (postState.posts().length > 0) {
        <div class="posts-grid">
          @for (post of postState.posts(); track post.id) {
            <article class="post-card">
              <h2>{{ post.title }}</h2>
              <p>{{ post.content }}</p>
              <div class="meta">
                <span>By {{ post.author.username }}</span>
                <span>{{ post.createdAt | date }}</span>
              </div>
            </article>
          }
        </div>
      } @else {
        <div class="empty">No posts found</div>
      }

      <!-- Load More Button -->
      @if (postState.hasMore() && !postState.loading()) {
        <button (click)="postState.loadMore()">Load More</button>
      }
    </div>
  `
})
export class PostsListComponent implements OnInit {
  postState = inject(PostStateService);

  ngOnInit() {
    // Load initial posts
    this.postState.loadPosts();
  }
}
```

---

### 2. Search Component

```typescript
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostStateService } from '@core/services/state/post-state.service';

@Component({
  selector: 'app-posts-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="search-box">
      <input
        type="text"
        [(ngModel)]="searchQuery"
        (input)="onSearch()"
        placeholder="Search posts..."
      />
      
      @if (searchQuery) {
        <button (click)="clearSearch()">Clear</button>
      }
      
      <div class="results-info">
        Found {{ postState.posts().length }} posts
      </div>
    </div>
  `
})
export class PostsSearchComponent {
  postState = inject(PostStateService);
  searchQuery = '';

  onSearch() {
    if (this.searchQuery.trim()) {
      this.postState.search(this.searchQuery);
    } else {
      this.postState.resetFilters();
    }
  }

  clearSearch() {
    this.searchQuery = '';
    this.postState.resetFilters();
  }
}
```

---

### 3. Filter & Sort Component

```typescript
import { Component, inject } from '@angular/core';
import { PostStateService } from '@core/services/state/post-state.service';

@Component({
  selector: 'app-posts-filters',
  standalone: true,
  template: `
    <div class="filters">
      <!-- Sort Options -->
      <div class="sort-controls">
        <label>Sort by:</label>
        <select (change)="onSortChange($event)">
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
          <option value="updatedAt-desc">Recently Updated</option>
        </select>
      </div>

      <!-- Tags Filter -->
      <div class="tags-filter">
        <label>Filter by tags:</label>
        <div class="tags">
          @for (tag of availableTags; track tag) {
            <button
              [class.active]="selectedTags.includes(tag)"
              (click)="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          }
        </div>
      </div>

      <!-- Reset Button -->
      <button (click)="resetAll()">Reset All Filters</button>
    </div>
  `
})
export class PostsFiltersComponent {
  postState = inject(PostStateService);
  
  availableTags = ['angular', 'typescript', 'nestjs', 'prisma'];
  selectedTags: string[] = [];

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const [orderBy, order] = value.split('-') as ['createdAt' | 'updatedAt' | 'title', 'asc' | 'desc'];
    this.postState.sortBy(orderBy, order);
  }

  toggleTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    
    if (this.selectedTags.length > 0) {
      this.postState.filterByTags(this.selectedTags);
    } else {
      this.postState.resetFilters();
    }
  }

  resetAll() {
    this.selectedTags = [];
    this.postState.resetFilters();
  }
}
```

---

### 4. Pagination Component

```typescript
import { Component, inject } from '@angular/core';
import { PostStateService } from '@core/services/state/post-state.service';

@Component({
  selector: 'app-posts-pagination',
  standalone: true,
  template: `
    <div class="pagination">
      <!-- Page Size Selector -->
      <div class="page-size">
        <label>Posts per page:</label>
        <select (change)="onPageSizeChange($event)">
          <option value="10">10</option>
          <option value="20" selected>20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      <!-- Page Navigation -->
      <div class="page-nav">
        <button
          (click)="postState.goToPage(postState.currentPage() - 1)"
          [disabled]="postState.currentPage() === 1"
        >
          Previous
        </button>
        
        <span>Page {{ postState.currentPage() }}</span>
        
        <button
          (click)="postState.goToPage(postState.currentPage() + 1)"
          [disabled]="!postState.hasMore()"
        >
          Next
        </button>
      </div>

      <!-- Total Info -->
      <div class="total-info">
        Total: {{ postState.total() }} posts
      </div>
    </div>
  `
})
export class PostsPaginationComponent {
  postState = inject(PostStateService);

  onPageSizeChange(event: Event) {
    const limit = Number((event.target as HTMLSelectElement).value);
    this.postState.changePageSize(limit);
  }
}
```

---

### 5. Advanced: Combined Search/Filter/Sort

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostStateService } from '@core/services/state/post-state.service';

@Component({
  selector: 'app-posts-advanced',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="advanced-search">
      <!-- Search Input -->
      <input
        type="text"
        [(ngModel)]="filters.search"
        (input)="applyFilters()"
        placeholder="Search..."
      />

      <!-- Tags -->
      <input
        type="text"
        [(ngModel)]="filters.tags"
        (input)="applyFilters()"
        placeholder="Tags (comma-separated)"
      />

      <!-- Author ID -->
      <input
        type="number"
        [(ngModel)]="filters.authorId"
        (input)="applyFilters()"
        placeholder="Author ID"
      />

      <!-- Sort -->
      <select [(ngModel)]="filters.orderBy" (change)="applyFilters()">
        <option value="createdAt">Created Date</option>
        <option value="updatedAt">Updated Date</option>
        <option value="title">Title</option>
      </select>

      <select [(ngModel)]="filters.order" (change)="applyFilters()">
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>

      <!-- Page Size -->
      <select [(ngModel)]="filters.limit" (change)="applyFilters()">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>

      <button (click)="reset()">Reset</button>
    </div>

    <!-- Results -->
    <div class="results">
      @if (postState.loading()) {
        <div class="loading">Loading...</div>
      }

      @for (post of postState.posts(); track post.id) {
        <div class="post">{{ post.title }}</div>
      }
    </div>
  `
})
export class PostsAdvancedComponent implements OnInit {
  postState = inject(PostStateService);

  filters = {
    search: '',
    tags: '',
    authorId: undefined as number | undefined,
    orderBy: 'createdAt' as 'createdAt' | 'updatedAt' | 'title',
    order: 'desc' as 'asc' | 'desc',
    limit: 20,
  };

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    this.postState.loadPosts({
      q: this.filters.search || undefined,
      tags: this.filters.tags || undefined,
      authorId: this.filters.authorId || undefined,
      orderBy: this.filters.orderBy,
      order: this.filters.order,
      limit: this.filters.limit,
      page: 1,
    });
  }

  reset() {
    this.filters = {
      search: '',
      tags: '',
      authorId: undefined,
      orderBy: 'createdAt',
      order: 'desc',
      limit: 20,
    };
    this.postState.resetFilters();
  }
}
```

---

### 6. Infinite Scroll Example

```typescript
import { Component, inject, OnInit, HostListener } from '@angular/core';
import { PostStateService } from '@core/services/state/post-state.service';

@Component({
  selector: 'app-posts-infinite',
  standalone: true,
  template: `
    <div class="infinite-scroll">
      @for (post of postState.posts(); track post.id) {
        <article class="post">
          <h2>{{ post.title }}</h2>
          <p>{{ post.content }}</p>
        </article>
      }

      @if (postState.loading()) {
        <div class="loading">Loading more...</div>
      }

      @if (!postState.hasMore() && postState.posts().length > 0) {
        <div class="end">No more posts</div>
      }
    </div>
  `
})
export class PostsInfiniteComponent implements OnInit {
  postState = inject(PostStateService);

  ngOnInit() {
    this.postState.loadFeed({ offset: 0, limit: 20 });
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Load more when user is near bottom (100px threshold)
    if (scrollPosition >= documentHeight - 100) {
      if (this.postState.hasMore() && !this.postState.loading()) {
        this.postState.loadMore();
      }
    }
  }
}
```

---

## 🔧 API Methods

### Core Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `loadPosts(params?)` | Load posts with filters | `IPostsQueryParams` |
| `loadFeed(params?)` | Load feed (offset-based) | `IPostsFeedQueryParams` |
| `loadMore()` | Append more posts | - |
| `getPostBySlug(slug)` | Get single post | `string` |

### Helper Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `search(query)` | Search posts | `string` |
| `filterByTags(tags)` | Filter by tags | `string[]` |
| `filterByAuthor(id)` | Filter by author | `number` |
| `sortBy(field, order)` | Sort posts | `orderBy`, `order` |
| `goToPage(page)` | Navigate to page | `number` |
| `changePageSize(limit)` | Change page size | `number` |
| `resetFilters()` | Reset all filters | - |
| `clear()` | Clear all state | - |

---

## 📊 State Signals

### Available Signals

```typescript
// Read-only signals
postState.posts()        // IPost[] - List of posts
postState.loading()      // boolean - Loading state
postState.error()        // string | null - Error message
postState.total()        // number - Total posts count
postState.currentPage()  // number - Current page
postState.totalPages()   // number - Total pages
postState.limit()        // number - Posts per page
postState.hasMore()      // boolean - Has more posts
postState.queryParams()  // IPostsQueryParams - Current filters
postState.state()        // IPostsState - Complete state object
```

---

## 🎨 Integration with Search Box Component

```typescript
// في الـ search-box.component.ts
import { Component, inject } from '@angular/core';
import { PostStateService } from '@core/services/state/post-state.service';

@Component({
  selector: 'app-search-box',
  // ... existing code
})
export class SearchBoxComponent {
  postState = inject(PostStateService);

  onSearch(query: string) {
    this.postState.search(query);
  }

  onFilterByTags(tags: string[]) {
    this.postState.filterByTags(tags);
  }

  onSort(orderBy: 'createdAt' | 'updatedAt' | 'title', order: 'asc' | 'desc') {
    this.postState.sortBy(orderBy, order);
  }
}
```

---

## 🚀 Best Practices

1. **Use Signals for Reactivity**: الـ signals بتوفر reactivity تلقائي
2. **Error Handling**: دايمًا اعرض الـ errors للمستخدم
3. **Loading States**: وضح للمستخدم إن في حاجة بتحمل
4. **Debounce Search**: استخدم debounce للـ search عشان تقلل الـ API calls
5. **Reset on Destroy**: لو محتاج تنضف الـ state عند الخروج من الـ component

---

## 💡 Tips

- استخدم `loadPosts()` للـ page-based pagination
- استخدم `loadFeed()` + `loadMore()` للـ infinite scroll
- الـ `queryParams` signal بيحفظ الفلاتر الحالية
- الـ `state` signal بيديك الـ state كله في object واحد

---

## 🔗 Related Files

- `post-state.service.ts` - Main service
- `posts.interface.ts` - TypeScript interfaces
- `search-box.component.ts` - Search component

---

**Happy Coding! 🎉**
