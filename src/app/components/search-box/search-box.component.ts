import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../env/env';
import { PostStateService } from '../../core/services/state/post-state.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IPost } from '../../core/services/interfaces/posts.interface';

@Component({
  selector: 'app-search-box',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.css',
})
export class SearchBoxComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _elRef = inject(ElementRef);
  readonly postState = inject(PostStateService);
  private readonly _router = inject(Router);

  private readonly _apiImg = environment.serchImg;
  readonly searchControl = this._fb.control('');
  readonly coverImg: string = this._apiImg;
  readonly showResults = signal<boolean>(false);

  ngOnInit(): void {
    // Listen to search input changes with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((value: string | null) => {
        const query = value?.trim() || '';
        
        if (query.length > 0) {
          // Search posts using the state service
          this.postState.search(query);
          this.showResults.set(true);
        } else {
          // Reset to show all posts when search is empty
          this.postState.resetFilters();
          this.showResults.set(false);
        }
      });
  }

  /**
   * Handle when a search result is selected
   */
  onResultSelected(post: IPost) {
    this.showResults.set(false);
    this.searchControl.setValue('', { emitEvent: false });
    this._router.navigate(['/post', post.slug]);
  }

  /**
   * Show results when input is focused (if there are results)
   */
  onFocus() {
    const hasResults = this.postState.posts().length > 0;
    const hasQuery = this.searchControl.value?.trim();
    
    if (hasResults && hasQuery) {
      this.showResults.set(true);
    }
  }

  /**
   * Hide results when clicking outside the component
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this._elRef.nativeElement.contains(event.target)) {
      this.showResults.set(false);
    }
  }

  /**
   * Clear search and reset filters
   */
  clearSearch() {
    this.searchControl.setValue('', { emitEvent: false });
    this.showResults.set(false);
    this.postState.resetFilters();
  }

  /**
   * Clean HTML content and return a preview snippet
   */
  getContentPreview(content: string | null | undefined, limit = 80, fallback = 'No content available'): string {
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
