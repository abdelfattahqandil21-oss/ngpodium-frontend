import { Component, computed, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { FeedsGlobalComponent } from '../feeds-global/feeds-global.component';
import { FeedsPrivateComponent } from '../feeds-private/feeds-private.component';
import { AuthStateService } from '../../core/services/state/auth-state.service';

@Component({
  selector: 'app-feeds',
  imports: [FeedsGlobalComponent, FeedsPrivateComponent],
  templateUrl: './feeds.component.html',
  styleUrl: './feeds.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedsComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  readonly isLoggedIn = this.authState.isLoggedIn;
  readonly activeTab = signal<'all' | 'mine'>('all');

  switchTab(tab: 'all' | 'mine') {
    this.activeTab.set(tab);
  }

  ngOnInit(): void {
    // Set SEO meta tags for home page
    this.title.setTitle('NgPodium - Modern Angular Blog Platform');
    
    this.meta.updateTag({ 
      name: 'description', 
      content: 'Discover and share amazing content on NgPodium. A modern blogging platform built with Angular featuring rich text editing, user profiles, and real-time updates.' 
    });
    
    this.meta.updateTag({ 
      property: 'og:title', 
      content: 'NgPodium - Modern Angular Blog Platform' 
    });
    
    this.meta.updateTag({ 
      property: 'og:description', 
      content: 'Discover and share amazing content on NgPodium. A modern blogging platform built with Angular.' 
    });
    
    this.meta.updateTag({ 
      property: 'og:type', 
      content: 'website' 
    });
    
    this.meta.updateTag({ 
      property: 'og:url', 
      content: 'https://ngpodium-frontend.vercel.app/' 
    });
    
    this.meta.updateTag({ 
      name: 'twitter:card', 
      content: 'summary_large_image' 
    });
    
    this.meta.updateTag({ 
      name: 'keywords', 
      content: 'blog, angular, typescript, writing, content, social media, platform' 
    });
  }
}
