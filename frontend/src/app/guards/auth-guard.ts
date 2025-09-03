import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if token exists and is not expired
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Then validate with backend
  return authService.validateToken().pipe(
    map(isValid => {
      if (isValid) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
