import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { authFeatureKey, authReducer } from './store/login/login.reducer';
import { provideEffects } from '@ngrx/effects';
import * as authEffects from './store/login/login.effects';

export const routes: Routes = [
   {
      path: 'login',
      loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
      providers: [provideState(authFeatureKey, authReducer), provideEffects(authEffects)],
   },
   {
      path: 'register',
      loadComponent: () =>
         import('./components/register/register.component').then((m) => m.RegisterComponent),
   },
   {
      path: 'user/verify/account/:key',
      loadComponent: () => import('./components/verify/verify.component').then((m) => m.VerifyComponent),
   },
   {
      path: 'user/verify/password/:key',
      loadComponent: () => import('./components/verify/verify.component').then((m) => m.VerifyComponent),
   },
   {
      path: 'resetpassword',
      loadComponent: () =>
         import('./components/resetpassword/resetpassword.component').then((m) => m.ResetpasswordComponent),
   },
   {
      path: '**',
      redirectTo: 'login',
   },
];
