import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, delay, finalize, lastValueFrom, of, Subject, take, takeUntil } from 'rxjs';
import { ToasterService } from 'src/app/common/toaster/toaster.service';
import { DataState } from 'src/app/enums/datastate.enum';
import { RoleEnum } from 'src/app/enums/role.enum';
import { Profile, UserEvent } from 'src/app/interfaces/appstate';
import { BreadcrumbItem } from 'src/app/interfaces/common.interface';
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
  private dataSubject = new BehaviorSubject<CustomHttpResponse<Profile> | undefined>(undefined);
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

  //checkbox show events profile
  public showProfileEvents = true;

  // breadcrumbs

  public items: BreadcrumbItem[] = [{ label: '', route: '/home', icon: 'pi pi-home' }, { label: 'Users', route: '/' }, { label: 'current-user' }];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private toasterService: ToasterService,
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
      const response = await lastValueFrom(this.userService.updateProfile(this.profileForm.value)); // Await the profile update
      // update profile with fetch data
      this.dataSubject.next({ ...response, data: response.data });
      this.profileState.set({
        ...this.profileState(),
        dataState: DataState.LOADED,
        appData: response,
      });
      this.toasterService.show('success', 'Success !', this.profileState().appData?.message ?? '');
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.profileState.set({
          ...this.profileState(),
          appData: this.dataSubject.value!,
          dataState: DataState.ERROR,
          error: error.error.reason,
        });
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
    this.passwordForm.disable();

    this.userService
      .verifyPassword(this.passwordForm.value)
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
          this.passwordForm.controls['password'].enable();
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<Profile>) => {
          // this.passwordForm.controls['newPassword'].enable();
          // this.passwordForm.controls['confirmPassword'].enable();
          this.passwordForm.enable();
          this.passwordVerified.set(true);
          this.passwordForm.markAsPristine();
        },
        error: (error: HttpErrorResponse) => {
          this.toasterService.show('error', 'Password verification.', error.error.reason ?? '');
        },
      });
  }

  public onPasswordFormSubmit(event: FormGroup): void {
    this.passwordForm = event;
    this.loading.set(true);
    const request = {
      password: this.passwordForm.value.password,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword,
    };
    if (request.newPassword === request.confirmPassword) {
      this.userService
        .updateUserPassword(request)
        .pipe(
          takeUntil(this.destroy),
          finalize(() => {
            this.loading.set(false);
            this.resetPasswordForm();
          }),
        )
        .subscribe({
          next: (response: CustomHttpResponse<Profile>) => {
            this.dataSubject.next(response);
            this.profileState.set({
              ...this.profileState(),
              dataState: DataState.LOADED,
              appData: this.dataSubject.value,
            });
            this.toasterService.show('success', 'Success !', this.profileState().appData?.message ?? '');
          },
          error: (error: HttpErrorResponse) => {
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
        .pipe(takeUntil(this.destroy))
        .subscribe({
          next: (response: CustomHttpResponse<Profile>) => {
            this.dataSubject.next(response);
            this.profileState.set({
              ...this.profileState(),
              dataState: DataState.LOADED,
              appData: response,
            });
            this.loading.set(false);
            this.toasterService.show('success', 'Success !', this.profileState().appData?.message ?? '');
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
      const response = await lastValueFrom(this.userService.updateUserSettings(request));
      // update profile with fetch data
      this.dataSubject.next({ ...response, data: response.data });
      this.profileState.set({
        ...this.profileState(),
        dataState: DataState.LOADED,
        appData: response,
      });
      this.accountSettingsForm.markAsPristine();
      this.toasterService.show('success', 'Success !', this.profileState().appData?.message ?? '');
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.toasterService.show('error', 'Error !', error.error.reason ?? '');
      }
    } finally {
      this.loading.set(false);
      this.accountSettingsForm.enable();
    }
  }

  public async onAuthenticationSettingsUpdate(event: any): Promise<void> {
    this.loading.set(true);
    const request = {
      usingMfa: !this.getUserInformations()?.usingMfa,
    };
    try {
      const response = await lastValueFrom(this.userService.updateUserAuthenticationSettings(request));
      // update profile with fetch data
      this.dataSubject.next({ ...response, data: response.data });
      this.profileState.set({
        ...this.profileState(),
        dataState: DataState.LOADED,
        appData: this.dataSubject.value,
      });
      this.toasterService.show('success', 'Success !', this.profileState().appData?.message ?? '');
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.toasterService.show('error', 'Error !', error.error.reason ?? '');
      }
    } finally {
      this.loading.set(false);
    }
  }

  public async onUpdateProfilePicture(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    // Check if files are selected
    if (inputElement && inputElement.files && inputElement.files.length > 0) {
      // Get the first file
      const file = inputElement.files[0];
      if (file) {
        this.loading.set(true);
        try {
          const response = await lastValueFrom(this.userService.updateUserImage(this.getFormData(file)));
          // update profile with fetch data
          // Modify the imageUrl directly in the response object
          if (response.data?.user) {
            response.data.user.imageUrl = `${response.data?.user.imageUrl}?time=${new Date().getTime()}`;
          }
          this.dataSubject.next({ ...response, data: response.data });
          this.profileState.set({
            ...this.profileState(),
            dataState: DataState.LOADED,
            appData: this.dataSubject.value,
          });
          this.toasterService.show('success', 'Success !', this.profileState().appData?.message ?? '');
        } catch (error) {
          if (error instanceof HttpErrorResponse) {
            this.toasterService.show('error', 'Error !', error.error.reason ?? '');
          }
        } finally {
          this.loading.set(false);
        }
      }
    }
  }
  private getFormData(image: File): FormData {
    const formdata = new FormData();
    formdata.append('image', image);
    return formdata;
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

  public getUserEvents(): UserEvent[] {
    return this.profileState()?.appData?.data?.events ?? [];
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
