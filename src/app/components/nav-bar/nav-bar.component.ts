import { Component, computed, effect, inject, signal } from '@angular/core';
import { environment } from '../../../env/env';
import { AuthStateService } from '../../core/services/state/auth-state.service';
import { SearchBoxComponent } from '../search-box/search-box.component';
import { LogoutComponent } from '../btns/logout/logout.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, SearchBoxComponent, LogoutComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
})
export class NavBarComponent {
private readonly authSSVC = inject(AuthStateService);
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
    if(this.profile()?.image){
      return this.api + this.profile()?.image;
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
  
  }
  ngOnInit(): void {
    this.authSSVC.getProfile();
  }

}
