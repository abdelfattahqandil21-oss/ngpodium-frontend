import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStateService } from '../../../core/services/state/auth-state.service';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutComponent {

  private readonly tokenService = inject(TokenService);
  private readonly authSSVC = inject(AuthStateService);
  private readonly router = inject(Router);
  onLogout(): void {
    this.authSSVC.logout();
    this.router.navigate(['/']);
  }
}
