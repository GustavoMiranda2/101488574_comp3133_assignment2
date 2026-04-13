//Name: Gustavo Miranda
//Student ID: 101488574

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionNest } from '../services/session-nest';

export const sessionGateGuard: CanActivateFn = () => {
  const sessionNest = inject(SessionNest);
  const router = inject(Router);

  if (sessionNest.hasLiveSession()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
