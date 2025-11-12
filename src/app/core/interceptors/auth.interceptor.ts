import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const token = tokenService.getToken();

  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        const token = tokenService.getToken();
        const refresh = tokenService.getRefreshToken();
        const expiresAt = tokenService.getExpiresAt();
        const now = Date.now();

        if (token && refresh && expiresAt && now >= +expiresAt) {
          return authService.refreshToken(refresh).pipe(
            switchMap((res) => {
              tokenService.setToken(res.access_token);

              if (res.expiresAt) tokenService.setExpiresAt(res.expiresAt);
              else if (res.expiresIn) tokenService.setExpiresAt(Date.now() + res.expiresIn * 1000);

              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${res.access_token}` },
              });
              return next(retryReq);
            }),
            catchError((innerErr) => {
              tokenService.removeToken();
              authService.setUnauthorized(true);
              return throwError(() => innerErr);
            })
          );
        } else {
          tokenService.removeToken();
          authService.setUnauthorized(true);
        }
      }
      return throwError(() => err);
    })
  );
};
