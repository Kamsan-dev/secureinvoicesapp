import { createActionGroup, props } from '@ngrx/store';
import { Profile } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { LoginRequestInterface } from 'src/app/interfaces/login-request';

export const authLoginAction = createActionGroup({
  source: '[auth] login',
  events: {
    Login: props<{ request: LoginRequestInterface }>(),
    'Login success': props<{ response: CustomHttpResponse<Profile> }>(),
    'Login failure': props<{ response: CustomHttpResponse<any> }>(),
  },
});

export const authMfaAction = createActionGroup({
  source: '[auth] mfa',
  events: {
    VerifyCode: props<{ request: any }>(),
    'Verify Code success': props<{ response: CustomHttpResponse<Profile> }>(),
    'Verify Code failure': props<{ response: CustomHttpResponse<any> }>(),
  },
});
