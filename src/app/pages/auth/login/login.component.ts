import { Component, inject, OnInit, signal } from '@angular/core';
import { LoginResponse } from '../../../core/services/interfaces/auth.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';
import { TokenService } from '../../../core/services/token.service';
import { RouterLink, Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private _fb = inject(FormBuilder);
  private authSvc = inject(AuthService);
  private TokenSvc = inject(TokenService);
  loginGb!: FormGroup;
  loginResponse$?: Observable<LoginResponse>;
  isLoading = signal(false);
  router = inject(Router);

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.loginGb = this._fb.group({
      userNameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.loginGb.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.authSvc.login(this.loginGb.value).subscribe({
     
      next: (res: LoginResponse) => {
          this.TokenSvc.setToken(res.access_token);
        this.TokenSvc.setRefreshToken(res.refresh_token);
        this.TokenSvc.setExpiresIn(res.expiresIn.toString());
        this.router.navigate(['/']);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        
      },
    });
  }
  
}


