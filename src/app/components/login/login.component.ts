import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, delay, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { LoginState, Profile } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { User } from 'src/app/interfaces/user';
import { PersistanceService } from 'src/app/services/persistance.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
  public loginForm: FormGroup;
  public verificationForm: FormGroup;
  public readonly phoneSig = signal<string | undefined>('');
  public readonly emailSig = signal<string | undefined>('');
  private destroy: Subject<void> = new Subject<void>();
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

  public loginState: LoginState = {
    dataState: DataState.LOADED,
    error: undefined,
    loginSuccess: false,
    message: undefined,
    isUsingMfa: false,
    currentUser: undefined,
  };

  //#region Forms
  public onSubmitForm(): void {
    const request = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.loginState = {
      ...this.loginState,
      dataState: DataState.LOADING,
    };
    this.userService
      .login(request)
      .pipe(takeUntil(this.destroy), delay(800))
      .subscribe({
        next: (response: CustomHttpResponse<Profile>) => {
          this.handleLoginResponse(response);
        },
        error: (errors: HttpErrorResponse) => {
          this.handleError(errors);
        },
      });
  }

  public onSubmitVerifyCode(): void {
    const request = {
      email: this.emailSig(),
      code: this.verificationForm.value.code,
    };
    this.loginState = {
      ...this.loginState,
      dataState: DataState.LOADING,
    };

    this.userService
      .verifyCode(request)
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (response: CustomHttpResponse<Profile>) => {
          this.persistanceService.set('access-token', response.data?.access_token);
          this.persistanceService.set('refresh-token', response.data?.refresh_token);
          this.loginState = {
            ...this.loginState,
            loginSuccess: true,
            dataState: DataState.LOADED,
            isUsingMfa: false,
            currentUser: response.data?.user,
          };
          this.router.navigateByUrl('/');
        },
        error: (errors: HttpErrorResponse) => {
          this.loginState = {
            ...this.loginState,
            dataState: DataState.ERROR,
            loginSuccess: false,
            isUsingMfa: true,
            error: errors.error.reason,
          };
        },
      });
  }

  public openLoginPage(event: MouseEvent): void {
    event.stopImmediatePropagation();
    this.loginState = {
      ...this.loginState,
      dataState: DataState.LOADED,
      loginSuccess: false,
      isUsingMfa: false,
    };
  }

  private handleLoginResponse(response: CustomHttpResponse<Profile>): void {
    const user = response.data?.user;
    if (user?.usingMfa) {
      this.handleMfaUser(user);
    } else {
      this.handleRegularUser(response);
    }
  }

  private handleMfaUser(user: User): void {
    this.phoneSig.set('...' + user.phone?.substring(6));
    this.emailSig.set(user.email);
    this.loginState = {
      ...this.loginState,
      loginSuccess: false,
      dataState: DataState.LOADED,
      isUsingMfa: true,
      currentUser: user,
    };
  }

  private handleRegularUser(response: CustomHttpResponse<Profile>): void {
    this.persistanceService.set('access-token', response.data?.access_token);
    this.persistanceService.set('refresh-token', response.data?.refresh_token);
    this.router.navigateByUrl('/register');
    this.loginState = {
      ...this.loginState,
      dataState: DataState.LOADED,
      loginSuccess: true,
      currentUser: response.data?.user,
      isUsingMfa: false,
      message: response.message,
    };
  }

  private handleError(errors: HttpErrorResponse): void {
    this.loginState = {
      ...this.loginState,
      dataState: DataState.ERROR,
      loginSuccess: false,
      isUsingMfa: false,
      error: errors.error.reason,
    };
  }

  //#endregion

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
