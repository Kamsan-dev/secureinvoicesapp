import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { inject } from '@angular/core';

export const redirectOnRootGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isAuthenticated()) {
    router.navigateByUrl('/dashboard');
  } else {
    router.navigateByUrl('/home');
  }
  return false;
};
