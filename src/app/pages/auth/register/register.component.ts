import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStateService } from '../../../core/services/state/auth-state.service';
import { TokenService } from '../../../core/services/token.service';
import { Observable } from 'rxjs';
import { RegisterResponse } from '../../../core/services/interfaces/auth.interface';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
    private _fb = inject(FormBuilder);
  private authSvc = inject(AuthService);
  private authStateSvc = inject(AuthStateService);
  private TokenSvc = inject(TokenService);
  private router = inject(Router);
  registerGb!: FormGroup;
  registerResponse$?: Observable<RegisterResponse>;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.registerGb = this._fb.group({
      fullName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['', [Validators.required]],
      major: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.registerGb.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authSvc.register(this.registerGb.value).subscribe({
      next: (res: RegisterResponse) => {
        this.TokenSvc.setToken(res.access_token);
        this.TokenSvc.setRefreshToken(res.refresh_token);
        this.TokenSvc.setExpiresIn(res.expiresIn);
        
        // Update auth state and load profile
        this.authStateSvc.login();
        this.authStateSvc.getProfile();
        
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const message = err?.error?.message;
        this.errorMessage.set(
          Array.isArray(message) 
            ? message.join(', ') 
            : message || 'Registration failed. Please try again.'
        );
      },
    });
  }

}
