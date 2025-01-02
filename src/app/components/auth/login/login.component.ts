import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToasterService } from 'src/app/common/toaster/toaster.service';
import { DataState } from 'src/app/enums/datastate.enum';
import { LoginState, Profile } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { User } from 'src/app/interfaces/user';
import { PersistanceService } from 'src/app/services/persistance.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy, OnInit {
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
    private toasterService: ToasterService,
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['dev@email.com', Validators.required],
      password: ['1234', Validators.required],
    });

    this.verificationForm = this.fb.nonNullable.group({
      code: ['', Validators.required],
    });
  }
  public ngOnInit(): void {
    this.userService.isAuthenticated() ? this.router.navigate(['/']) : null;
  }

  public loginState: LoginState = {
    dataState: DataState.LOADED,
    error: undefined,
    loginSuccess: false,
    message: undefined,
    isUsingMfa: false,
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
      .pipe(takeUntil(this.destroy))
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
          };
          this.router.navigateByUrl('/');
          this.toasterService.show('success', 'Login success !', this.loginState.message ?? '');
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
    };
    this.toasterService.show('success', 'Confirm authentication.', this.loginState.message ?? '');
  }

  private handleRegularUser(response: CustomHttpResponse<Profile>): void {
    this.persistanceService.set('access-token', response.data?.access_token);
    this.persistanceService.set('refresh-token', response.data?.refresh_token);
    this.router.navigateByUrl('/');
    this.loginState = {
      ...this.loginState,
      dataState: DataState.LOADED,
      loginSuccess: true,
      isUsingMfa: false,
      message: response.message,
    };
    this.toasterService.show('success', 'Login success !', this.loginState.message ?? '');
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
