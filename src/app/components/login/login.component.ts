import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, catchError, delay, map, of, startWith } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { LoginState, Profile } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { PersistanceService } from 'src/app/services/persistance.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
  public loginState$: Observable<LoginState> = of(this.initialState);
  public readonly phoneSig = signal<string | undefined>('');
  public readonly emailSig = signal<string | undefined>('');
  constructor(
    private fb: FormBuilder,
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
  }

  public onSubmitForm(): void {
    const request = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };
    this.loginState$ = this.userService.login(request).pipe(
      delay(1500),
      map((response: CustomHttpResponse<Profile>) => {
        const user = response.data?.user;
        if (user?.usingMfa) {
          this.phoneSig.set('...' + user.phone?.substring(6));
          this.emailSig.set(user.email);
          return {
            ...this.initialState,
            loginSuccess: false,
            dataState: DataState.LOADED,
            isUsingMfa: true,
            currentUser: user,
          } as LoginState;
        } else {
          this.persistanceService.set('access-token', response.data?.access_token);
          this.persistanceService.set('refresh-token', response.data?.refresh_token);
          this.router.navigateByUrl('/register');
          return {
            ...this.initialState,
            dataState: DataState.LOADED,
            loginSuccess: true,
            currentUser: user,
            isUsingMfa: false,
            message: response.message,
          } as LoginState;
        }
      }),
      startWith({
        ...this.initialState,
        dataState: DataState.LOADING,
      } as LoginState),
      catchError((errors: HttpErrorResponse) => {
        return of({
          ...this.initialState,
          dataState: DataState.ERROR,
          loginSuccess: false,
          isUsingMfa: false,
          error: errors.error.reason,
        } as LoginState);
      }),
    );
  }

  public onSubmitVerifyCode(): void {
    const request = {
      email: this.emailSig(),
      code: this.verificationForm.value.code,
    };
    console.log(request);
    this.loginState$ = this.userService.verifyCode(request).pipe(
      map((response: CustomHttpResponse<Profile>) => {
        this.persistanceService.set('access-token', response.data?.access_token);
        this.persistanceService.set('refresh-token', response.data?.refresh_token);
        this.router.navigateByUrl('/register');
        return {
          ...this.initialState,
          loginSuccess: true,
          dataState: DataState.LOADED,
          isUsingMfa: false,
          currentUser: response.data?.user,
        } as LoginState;
      }),
      startWith({ dataState: DataState.LOADING } as LoginState),
      catchError((errors: HttpErrorResponse) => {
        return of({
          ...this.initialState,
          dataState: DataState.ERROR,
          loginSuccess: false,
          isUsingMfa: true,
          error: errors.error.reason,
        });
      }),
    );
  }
}
