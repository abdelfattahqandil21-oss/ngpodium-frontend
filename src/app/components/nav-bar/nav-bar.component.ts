import { Component, computed, effect, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { environment } from '../../../env/env';
import { AuthStateService } from '../../core/services/state/auth-state.service';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { LogoutComponent } from '../btns/logout/logout.component';
import { profileImageUrl } from '../../shared/utils/image-url.util';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, SearchBoxComponent, LogoutComponent, NgOptimizedImage],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavBarComponent implements OnInit {
private readonly authSSVC = inject(AuthStateService);
private readonly router = inject(Router);
private readonly profile = this.authSSVC.profile;
readonly isLoggedIn = this.authSSVC.isLoggedIn;

  constructor(){
    effect(()=>{
      console.log(this.isLoggedIn());
    })
  }

  protected readonly api = environment.profile;
  protected readonly logo: string = "Ng Podium";
  readonly menuOpen = signal(false);
  toggleMenu(): void {
    this.menuOpen.update(v => !v); 
  }

  imgProfile = computed(() => {
    const profileData = this.profile();
    return profileImageUrl(profileData?.image, environment.profile, '/assets/avatar.png');
  });

  // Check if using static fallback image
  isUsingStaticAvatar = computed(() => {
    const profileData = this.profile();
    const loggedIn = this.isLoggedIn();
    return !loggedIn || !profileData?.image;
  });

  nameProfile = computed(() => {
    if(this.profile()?.username){
      return this.profile()?.username;
    }
    return 'User';
  });

  onClickWrite(){
    this.router.navigate(['/write-post']);
    this.menuOpen.set(false); // Close mobile menu
  }
  ngOnInit(): void {
    // Profile is auto-loaded by AuthStateService when user is logged in
  }

}
