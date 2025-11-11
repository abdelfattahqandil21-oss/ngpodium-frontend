import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, debounceTime, switchMap, finalize } from 'rxjs';
import { environment } from '../../../env/env';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  imports: [ ReactiveFormsModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.css',
})
export class SearchBoxComponent {
private _fb = inject(FormBuilder);
  // private _postService = inject(PostService);
  private _elRef = inject(ElementRef);
  // private _loader = inject(LoaderService);

  private _apiImg = environment.imgUrl;
  searchControl = this._fb.control('');
  coverImg: string = this._apiImg;
  results$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  showResults = false;

  // protected readonly loader = this._loader;

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        // switchMap((value : string | null) => {
          // this._loader.show(LoaderType.Small);
        //   return this._postService
        //     .searchPost(value || '')
        //     .pipe(finalize(() => this._loader.hide(LoaderType.Small)));
        // })
      )
      .subscribe((res) => {
        this.results$.next([]);
        this.showResults = true;
      });
  }

  onResultSelected() {
    this.showResults = false;
  }

  onFocus() {
    if (this.results$.value.length) {
      this.showResults = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this._elRef.nativeElement.contains(event.target)) {
      this.showResults = false;
    }
  }
}
