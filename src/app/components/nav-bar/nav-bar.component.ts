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
readonly isLoggedIn = this.authSSVC.isLoggedIn;

  constructor(){
    effect(()=>{
      console.log(this.isLoggedIn());
    })
  }

  protected readonly api = environment.imgUrl;
  protected readonly logo: string = "Ng Podium";
  readonly menuOpen = signal(false);
  toggleMenu(): void {
    this.menuOpen.update(v => !v); 
  }

  imgProfile = computed(() => {
    
    return '/assets/avatar.png';
  });

  onClickWrite(){
  
  }
  ngOnInit(): void {
    
  }

}
