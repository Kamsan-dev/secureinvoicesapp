import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { Profile, ResetPasswordState } from 'src/app/interfaces/appstate';
import { UserService } from 'src/app/services/user.service';
import { Router, RouterModule } from '@angular/router';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss'],
})
export class ResetpasswordComponent implements OnDestroy {
  public resetPasswordForm!: FormGroup;
  //public verificationForm: FormGroup;
  private destroy: Subject<void> = new Subject<void>();
  public resetPasswordState: ResetPasswordState = {
    dataState: DataState.LOADED,
    error: undefined,
    message: undefined,
  };
  public loading = signal<boolean>(false);
  public readonly dataState = DataState;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
  ) {
    this.resetPasswordForm = this.fb.nonNullable.group({
      email: ['', Validators.required],
    });
  }

  public onResetPasswordSubmit(): void {
    this.loading.set(true);
    this.resetPasswordForm.disable();
    this.userService
      .resetPassword(this.resetPasswordForm.value.email)
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
          this.resetPasswordForm.enable();
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<Profile>) => {
          console.log(response);
          this.resetPasswordState = {
            ...this.resetPasswordState,
            dataState: DataState.LOADED,
            message: response.message,
          };
          this.resetPasswordForm.reset();
          this.resetPasswordForm.markAsPristine();
        },
        error: (errors: HttpErrorResponse) => {
          console.log(errors);
          this.resetPasswordState = {
            ...this.resetPasswordState,
            dataState: DataState.ERROR,
            error: errors.error.reason,
          };
          this.resetPasswordForm.enable();
          console.log(errors);
        },
      });
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
