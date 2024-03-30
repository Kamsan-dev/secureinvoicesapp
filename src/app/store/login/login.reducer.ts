import { createFeature, createReducer, on } from '@ngrx/store';
import { DataState } from 'src/app/enums/datastate.enum';
import { LoginState } from 'src/app/interfaces/appstate';
import { authLoginAction, authMfaAction } from './login.action';

const initialState: LoginState = {
   dataState: DataState.LOADED,
   error: undefined,
   loginSuccess: false,
   message: undefined,
   isUsingMfa: false,
   currentUser: undefined,
};

const authFeature = createFeature({
   name: 'login',
   reducer: createReducer(
      initialState,
      on(authLoginAction.login, (state) => ({
         ...state,
         dataState: DataState.LOADING,
      })),
      on(authLoginAction.loginSuccess, (state, action) => ({
         ...state,
         dataState: DataState.LOADED,
         loginSuccess: true,
         message: action.response.message,
         currentUser: action.response.data?.user,
         isUsingMfa: action.response.data?.user?.usingMfa,
      })),
      on(authLoginAction.loginFailure, (state, action) => ({
         ...state,
         dataState: DataState.ERROR,
         loginSuccess: false,
         error: action.response.reason,
      })),
      on(authMfaAction.verifyCode, (state) => ({
         ...state,
         dataState: DataState.LOADING,
      })),
      on(authMfaAction.verifyCodeSuccess, (state, action) => ({
         ...state,
         dataState: DataState.LOADED,
         isUsingMfa: true,
         message: action.response.message,
         currentUser: action.response.data?.user,
      })),
      on(authMfaAction.verifyCodeFailure, (state, action) => ({
         ...state,
         dataState: DataState.ERROR,
         loginSuccess: false,
         error: action.response.reason,
      })),
   ),
});

export const {
   name: authFeatureKey,
   reducer: authReducer,
   selectDataState,
   selectIsUsingMfa,
   selectError,
   selectMessage,
   selectLoginSuccess,
   selectCurrentUser,
   selectLoginState,
} = authFeature;
