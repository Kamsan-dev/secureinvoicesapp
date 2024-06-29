import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, exhaustMap, map, of, tap } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { authLoginAction, authMfaAction } from './login.action';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Profile } from 'src/app/interfaces/appstate';
import { HttpErrorResponse } from '@angular/common/http';
import { PersistanceService } from 'src/app/services/persistance.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

let isUsingMfa: boolean | undefined;
export const authLoginEffects = createEffect(
  (action$ = inject(Actions), userService = inject(UserService), persistanceService = inject(PersistanceService)) => {
    return action$.pipe(
      ofType(authLoginAction.login),
      concatMap(({ request }) => {
        return userService.login(request).pipe(
          map((response: CustomHttpResponse<Profile>) => {
            if (!response.data?.user?.usingMfa) {
              persistanceService.set('access-token', response.data?.access_token);
              persistanceService.set('refresh-token', response.data?.refresh_token);
            }
            isUsingMfa = response.data?.user?.usingMfa;
            return authLoginAction.loginSuccess({ response });
          }),
          catchError((error: HttpErrorResponse) => {
            return of(
              authLoginAction.loginFailure({
                response: error.error,
              }),
            );
          }),
        );
      }),
    );
  },
  { functional: true },
);

export const redirectAfterLoginSuccessEffect = createEffect(
  (action$ = inject(Actions), router = inject(Router), store = inject(Store)) => {
    return action$.pipe(
      ofType(authLoginAction.loginSuccess, authMfaAction.verifyCodeSuccess),
      tap(() => {
        if (!isUsingMfa) {
          router.navigateByUrl('/register');
        } else {
          //router.navigateByUrl('/login');
          isUsingMfa = false;
        }
      }),
    );
  },
  { functional: true, dispatch: false },
);

export const verifyCodeEffect = createEffect(
  (action$ = inject(Actions), userService = inject(UserService), persistanceService = inject(PersistanceService)) => {
    return action$.pipe(
      ofType(authMfaAction.verifyCode),
      exhaustMap(({ request }) => {
        return userService.verifyCode(request).pipe(
          map((response: CustomHttpResponse<Profile>) => {
            persistanceService.set('access-token', response.data?.access_token);
            persistanceService.set('refresh-token', response.data?.refresh_token);
            return authMfaAction.verifyCodeSuccess({ response });
          }),
          catchError((error: HttpErrorResponse) => {
            return of(
              authMfaAction.verifyCodeFailure({
                response: error.error,
              }),
            );
          }),
        );
      }),
    );
  },
  { functional: true },
);
