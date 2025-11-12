import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
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
export class FeedsComponent {
    authStateService = inject(AuthStateService)

isLoggedIn = computed(() => this.authStateService.isLoggedIn())
activeTab = signal<'all' | 'mine'>('all');
  switchTab(tab: 'all' | 'mine') {
    this.activeTab.set(tab);
  }
}
