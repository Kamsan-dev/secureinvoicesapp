import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { Profile } from 'src/app/interfaces/appstate';
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

  private destroy: Subject<void> = new Subject<void>();

  public profileForm!: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      address: [''],
      jobTitle: [''],
      bio: [''],
    });

    this.loadUserProfile();
  }

  //#region Forms

  private loadUserProfile(): void {
    this.userService
      .profile()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (response: CustomHttpResponse<Profile>) => {
          console.log(response);
          this.dataSubject.next(response);
          this.profileState.set({
            ...this.profileState(),
            appData: response,
          });

          // Populate the form with the loaded data
          this.populateForm();
        },
        error: (error: string) => {
          this.profileState.set({
            ...this.profileState(),
            appData: this.dataSubject.value!,
            error: error,
          });
        },
      });
  }

  private populateForm(): void {
    const user = this.getUserInformations(); // Get user data

    if (user) {
      this.profileForm.setValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        jobTitle: user.title || '',
        bio: user.bio || '',
      });
    }
  }

  // Handle profile form submission
  public onProfileSubmit(): void {
    if (this.profileForm.valid) {
      console.log('Profile form submitted:', this.profileForm.value);
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
