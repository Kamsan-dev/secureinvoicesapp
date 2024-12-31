import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToasterService } from 'src/app/common/toaster/toaster.service';
import { DataState } from 'src/app/enums/datastate.enum';
import { Profile, RegisterState } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  public registerForm!: FormGroup;
  //public verificationForm: FormGroup;
  private destroy: Subject<void> = new Subject<void>();
  public registerState: RegisterState = {
    dataState: DataState.LOADED,
    error: undefined,
    registerSuccess: false,
    message: undefined,
  };
  public loading = signal<boolean>(false);
  public readonly dataState = DataState;
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private toasterService: ToasterService,
  ) {
    this.registerForm = this.fb.nonNullable.group({
      firstName: [''],
      lastName: [''],
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    console.log('Toast sending registration');
    this.toasterService.show('success', 'Well done!', 'body');
    this.toasterService.show('error', 'Well done!', 'body');
    this.toasterService.show('warning', 'Well done!', 'body');
  }

  public onRegisterSubmit(): void {
    this.loading.set(true);
    this.registerForm.disable();
    this.userService
      .register(this.registerForm.value)
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
          this.registerForm.enable();
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<Profile>) => {
          console.log(response);
          this.registerState = {
            ...this.registerState,
            dataState: DataState.LOADED,
            registerSuccess: true,
            message: response.message,
          };
          this.registerForm.reset();
          this.registerForm.markAsPristine();
          this.toasterService.show('success', 'Well done!', this.registerState.message ?? '');
        },
        error: (errors: HttpErrorResponse) => {
          console.log(errors);
          this.registerState = {
            ...this.registerState,
            dataState: DataState.ERROR,
            registerSuccess: false,
            error: errors.error.reason,
          };
          this.registerForm.enable();
          console.log(errors);
        },
      });
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
