import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, delay, lastValueFrom, of, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { Profile, RoleEnum } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { State } from 'src/app/interfaces/state';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
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

  public profileForm!: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
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

    this.loadUserProfile();
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
          this.populateForm();
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

  private populateForm(): void {
    const user = this.getUserInformations(); // Get user data

    if (user) {
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

      if (user.roleName === RoleEnum.ROLE_USER) {
        this.profileForm.disable();
      }
    }
  }

  // Handle profile form submission
  public async onProfileSubmit(): Promise<void> {
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
      this.profileForm.markAsPristine();
      this.profileForm.enable();
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

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
