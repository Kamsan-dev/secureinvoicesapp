import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, delay, lastValueFrom, of, Subject, take, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { Profile, RoleEnum } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { State } from 'src/app/interfaces/state';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'se-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
  private dataSubject = new BehaviorSubject<CustomHttpResponse<Profile> | null>(null);
  public profileState = signal<State<CustomHttpResponse<Profile>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  //forms
  public profileForm!: FormGroup;
  public passwordForm!: FormGroup;
  private originalUserProfileFormValue: any;
  public passwordVerified = signal(false);
  public accountSettingsForm!: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
  ) {}

  public ngOnInit(): void {
    this.profileForm = this.fb.group({
      userId: [''],
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      address: [''],
      title: [''],
      bio: [''],
    });

    this.accountSettingsForm = this.fb.group({
      enabled: [''],
      notLocked: [''],
    });
    this.loadUserProfile();

    this.passwordForm = this.fb.group({
      password: [''],
      newPassword: [{ value: '', disabled: true }],
      confirmPassword: [{ value: '', disabled: true }],
    });
  }

  //#region Forms

  private loadUserProfile(): void {
    this.profileState().dataState = DataState.LOADING;
    this.userService
      .profile()
      .pipe(delay(1000), takeUntil(this.destroy))
      .subscribe({
        next: (response: CustomHttpResponse<Profile>) => {
          console.log(response);
          this.dataSubject.next(response);
          this.profileState.set({
            ...this.profileState(),
            dataState: DataState.LOADED,
            appData: response,
          });
          // Populate the form with the loaded data
          this.populateForms();
        },
        error: (error: HttpErrorResponse) => {
          this.profileState.set({
            ...this.profileState(),
            appData: this.dataSubject.value!,
            dataState: DataState.ERROR,
            error: error.error.reason,
          });
        },
      });
  }

  private populateForms(): void {
    const user = this.getUserInformations(); // Get user data

    if (user) {
      // Profile Form
      this.profileForm.setValue({
        userId: user.userId || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        title: user.title || '',
        bio: user.bio || '',
      });

      if (user.roleName !== RoleEnum.ROLE_SYSADMIN && user.roleName !== RoleEnum.ROLE_ADMIN) {
        this.profileForm.disable();
        this.accountSettingsForm.disable();
      }

      // Account Settings form

      this.accountSettingsForm.setValue({
        enabled: user.enabled,
        notLocked: user.notLocked,
      });
    }
    this.originalUserProfileFormValue = { ...this.profileForm.value };
  }

  // Handle profile form submission
  public async onProfileSubmit(event: FormGroup): Promise<void> {
    this.profileForm = event;
    this.loading.set(true);
    try {
      this.profileForm.disable();
      await lastValueFrom(of(null).pipe(delay(3000)));
      const response = await lastValueFrom(this.userService.updateProfile(this.profileForm.value)); // Await the profile update
      // update profile with fetch data
      this.dataSubject.next({ ...response, data: response.data });
      this.profileState.set({
        ...this.profileState(),
        dataState: DataState.LOADED,
        appData: response,
      });
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.profileState.set({
          ...this.profileState(),
          appData: this.dataSubject.value!,
          dataState: DataState.ERROR,
          error: error.error.reason,
        });
      } else {
        console.log('An unknown error occurred', error);
      }
    } finally {
      this.loading.set(false);
      this.originalUserProfileFormValue = { ...this.profileForm.value };
      this.profileForm.markAsPristine();
      this.profileForm.enable();
    }
  }

  public onCancelUserProfileChanges(): void {
    this.profileForm.reset(this.originalUserProfileFormValue);
  }

  // Handle password form submission

  public async onVerifyPasswordButtonClick(): Promise<void> {
    this.loading.set(true);
    const request = {
      password: this.passwordForm.value.password,
    };
    try {
      this.passwordForm.disable();
      await lastValueFrom(of(null).pipe(delay(300)));
      const response = await lastValueFrom(this.userService.verifyPassword(request));
      this.passwordForm.controls['newPassword'].enable();
      this.passwordForm.controls['confirmPassword'].enable();
      this.passwordVerified.set(true);
      this.passwordForm.markAsPristine();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.log(error.error.reason);
      } else {
        console.log('An unknown error occurred', error);
      }
    } finally {
      this.loading.set(false);
      this.passwordForm.controls['password'].enable();
    }
  }

  public onPasswordFormSubmit(event: FormGroup): void {
    this.passwordForm = event;
    this.loading.set(true);
    const request = {
      password: this.passwordForm.value.password,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword,
    };
    console.log(request);
    if (request.newPassword === request.confirmPassword) {
      this.userService
        .updateUserPassword(request)
        .pipe(takeUntil(this.destroy), delay(300))
        .subscribe({
          next: (response: CustomHttpResponse<Profile>) => {
            this.resetPasswordForm();
            this.loading.set(false);
            console.log(response.message);
          },
          error: (error: HttpErrorResponse) => {
            console.log(error.error.reason);
            this.resetPasswordForm();
            this.loading.set(false);
          },
        });
    } else {
      this.resetPasswordForm();
      this.loading.set(false);
    }
  }

  private resetPasswordForm(): void {
    this.passwordForm.reset({
      password: '',
      newPassword: { value: '', disabled: true },
      confirmPassword: { value: '', disabled: true },
    });
  }

  public onUserRoleUpdate(event: string): void {
    this.loading.set(true);
    const request = {
      roleName: event,
    };
    if (event !== this.getUserInformations()?.roleName) {
      this.userService
        .updateUserRole(request)
        .pipe(takeUntil(this.destroy), delay(1500))
        .subscribe({
          next: (response: CustomHttpResponse<Profile>) => {
            console.log(response);
            this.dataSubject.next(response);
            this.profileState.set({
              ...this.profileState(),
              dataState: DataState.LOADED,
              appData: response,
            });
            this.loading.set(false);
          },
          error: (error: HttpErrorResponse) => {
            this.profileState.set({
              ...this.profileState(),
              appData: this.dataSubject.value!,
              dataState: DataState.ERROR,
              error: error.error.reason,
            });
            this.loading.set(false);
          },
        });
    } else {
      this.loading.set(false);
    }
  }

  public async onAccountSettingsFormSubmit(event: FormGroup): Promise<void> {
    this.accountSettingsForm = event;
    this.loading.set(true);
    const request = {
      enabled: this.accountSettingsForm.value.enabled,
      notLocked: this.accountSettingsForm.value.notLocked,
    };
    try {
      this.accountSettingsForm.disable();
      await lastValueFrom(of(null).pipe(delay(500)));
      const response = await lastValueFrom(this.userService.updateUserSettings(request));
      this.accountSettingsForm.markAsPristine();
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        console.log(error.error.reason);
      } else {
        console.log('An unknown error occurred', error);
      }
    } finally {
      this.loading.set(false);
      this.accountSettingsForm.enable();
    }
  }

  //#endregion

  //#region UserInformations
  public getUserName(): string {
    return this.profileState().appData?.data?.user?.firstName + ' ' + this.profileState().appData?.data?.user?.lastName;
  }

  public getUserPictureProfile(): string {
    return this.profileState().appData?.data?.user?.imageUrl || 'https://img.freepik.com/free-icon/user_318-159711.jpg';
  }

  public getUserJoinDate(): Date {
    return this.profileState().appData?.data?.user?.createdAt || new Date();
  }

  public getUserInformations(): User | null {
    return this.profileState().appData?.data?.user || null;
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
