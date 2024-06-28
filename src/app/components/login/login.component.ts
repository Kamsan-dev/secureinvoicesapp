import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Signal, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, catchError, delay, map, of, startWith } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { LoginState, Profile } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { PersistanceService } from 'src/app/services/persistance.service';
import { UserService } from 'src/app/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private initialState: LoginState = {
    dataState: DataState.LOADED,
    error: undefined,
    loginSuccess: false,
    message: undefined,
    isUsingMfa: false,
    currentUser: undefined,
  };
  public loginForm: FormGroup;
  public verificationForm: FormGroup;
  public loginState$: Observable<any> = of(this.initialState);
  public phoneSubject = new BehaviorSubject<string | undefined>('null');
  private emailSubject = new BehaviorSubject<string | undefined>('null');

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private userService: UserService,
    private persistanceService: PersistanceService,
    private router: Router,
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['dev@email.com', Validators.required],
      password: ['1234', Validators.required],
    });

    this.verificationForm = this.fb.nonNullable.group({
      code: ['', Validators.required],
    });

    //this.loginState$ = this.store.select(selectLoginState);
  }

  onSubmitForm(): void {
    const request = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };
    console.log(request);
    this.loginState$ = this.userService.login(request).pipe(
      delay(3000),
      map((response: CustomHttpResponse<Profile>) => {
        if (response.data?.user?.usingMfa) {
          this.phoneSubject.next('...' + response.data.user.phone?.substring(6));
          this.emailSubject.next(response.data.user.email);
          return {
            loginSuccess: false,
            dataState: DataState.LOADED,
            isUsingMfa: true,
            currentUser: response.data?.user,
          };
        } else {
          this.persistanceService.set('access-token', response.data?.access_token);
          this.persistanceService.set('refresh-token', response.data?.refresh_token);
          this.router.navigateByUrl('/register');
          return {
            dataState: DataState.LOADED,
            loginSuccess: true,
            currentUser: response.data?.user,
            isUsingMfa: false,
            message: response.message,
          };
        }
      }),
      startWith({
        dataState: DataState.LOADING,
        isUsingMfa: false,
      }),
      catchError((errors: HttpErrorResponse) => {
        //console.log(errors);
        return of({
          dataState: DataState.ERROR,
          loginSuccess: false,
          isUsingMfa: false,
          error: errors.error.reason,
        });
      }),
    );
  }

  onSubmitVerifyCode(): void {
    const request = {
      email: this.emailSubject.getValue(),
      code: this.verificationForm.value.code,
    };
    console.log(request);
    this.loginState$ = this.userService.verifyCode(request).pipe(
      map((response: CustomHttpResponse<Profile>) => {
        this.persistanceService.set('access-token', response.data?.access_token);
        this.persistanceService.set('refresh-token', response.data?.refresh_token);
        this.router.navigateByUrl('/register');
        return {
          loginSuccess: true,
          dataState: DataState.LOADED,
          isUsingMfa: false,
          currentUser: response.data?.user,
        };
      }),
      startWith({ dataState: DataState.LOADING }),
      catchError((errors: HttpErrorResponse) => {
        return of({
          dataState: DataState.ERROR,
          loginSuccess: false,
          isUsingMfa: true,
          error: errors.error.reason,
        });
      }),
    );
    //this.store.dispatch(authMfaAction.verifyCode({ request }));
  }

  // onSubmitForm(): void {
  //    const request = {
  //       email: this.loginForm.value.email,
  //       password: this.loginForm.value.password,
  //    };
  //    this.store.dispatch(authLoginAction.login({ request }));
  // }
}
function WritableSignal<T>(initialState: LoginState) {
  throw new Error('Function not implemented.');
}
