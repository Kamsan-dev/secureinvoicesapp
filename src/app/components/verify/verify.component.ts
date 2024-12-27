import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, map, Subject, switchMap, takeUntil } from 'rxjs';
import { AccountType, Profile, VerifyState } from 'src/app/interfaces/appstate';
import { DataState } from 'src/app/enums/datastate.enum';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss'],
})
export class VerifyComponent implements OnInit, OnDestroy {
  public resetPasswordForm!: FormGroup;
  private destroy: Subject<void> = new Subject<void>();
  public verifyState: VerifyState = {
    dataState: DataState.LOADING,
    title: 'Verifying...',
    verifySuccess: false,
    message: 'Please, wait while we verify the informations',
  };
  public user = signal<User | undefined>(undefined);
  public loading = signal<boolean>(false);
  public readonly DataState = DataState;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.resetPasswordForm = this.fb.nonNullable.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }
  public ngOnInit(): void {
    const type = this.getAccountType(this.router.url);

    this.activatedRoute.paramMap
      .pipe(
        finalize(() => {
          this.loading.set(false);
        }),
        takeUntil(this.destroy),
        map((params) => params.get('key') || ''),
        switchMap((key) => this.userService.verify(key, type)),
      )
      .subscribe({
        next: (response: CustomHttpResponse<Profile | null>) => {
          if (type === 'password') {
            this.user.set(response.data?.user);
          }
          this.verifyState = {
            ...this.verifyState,
            type: type,
            verifySuccess: true,
            dataState: DataState.LOADED,
            message: response.message,
            title: 'Verified !',
          };
        },
        error: (error: HttpErrorResponse) => {
          this.verifyState = {
            ...this.verifyState,
            type: type,
            verifySuccess: false,
            dataState: DataState.ERROR,
            error: error.error.reason,
            title: 'An error occurred',
          };
        },
      });
  }

  private getAccountType(url: string): AccountType {
    return url.includes('password') ? 'password' : 'account';
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  //#region form

  public renewPassword(): void {
    this.loading.set(true);
    this.resetPasswordForm.disable();
    const key = this.activatedRoute.snapshot.params['key'];
    console.log(this.resetPasswordForm.value);
    this.userService
      .renewPassword(key, this.resetPasswordForm.value)
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
          this.resetPasswordForm.enable();
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<null>) => {
          this.verifyState = {
            ...this.verifyState,
            type: 'account',
            verifySuccess: true,
            dataState: DataState.LOADED,
            message: response.message,
            title: 'Password successfully reseted !',
          };
          this.resetPasswordForm.reset();
        },
        error: (error: HttpErrorResponse) => {
          this.verifyState = {
            ...this.verifyState,
            dataState: DataState.LOADED,
            error: error.error.reason,
            title: 'An error occurred',
          };
        },
      });
  }

  //#endregion
}
