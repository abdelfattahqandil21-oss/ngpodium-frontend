import { Component, computed, effect, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../env/env';
import { AuthStateService } from '../../core/services/state/auth-state.service';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { LogoutComponent } from '../btns/logout/logout.component';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, SearchBoxComponent, LogoutComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
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
    
    if(profileData?.image){
      let imagePath = profileData.image;
      
      // Remove any base URL if present (e.g., http://localhost:3000)
      imagePath = imagePath.replace(/^https?:\/\/[^\/]+/, '');
      
      // If image is just a filename (no path), use environment.profile
      // If it already has /uploads/profile/, use imgUrl base
      if (!imagePath.startsWith('/')) {
        // Just filename: abdo-123.webp
        return environment.profile + imagePath;
      } else if (imagePath.startsWith('/uploads/profile/')) {
        // Full path: /uploads/profile/abdo-123.webp
        return 'http://localhost:3000' + imagePath;
      } else {
        // Other path: /some/path/image.webp
        return environment.profile + imagePath;
      }
    }
    
    return '/assets/avatar.png';
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
    this.authSSVC.getProfile();
  }

}
