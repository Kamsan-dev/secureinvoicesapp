import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { DataState } from 'src/app/enums/datastate.enum';
import { Profile, Role, RoleEnum } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'se-profile-authorization',
  templateUrl: './profile-authorization.component.html',
  styleUrls: ['./profile-authorization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileAuthorizationComponent {
  public constructor() {
    effect(
      () => {
        /* update selected role only one time when data user are loaded from the database */
        if (this.selectedRole() === '') {
          this.selectedRole.set(this.userInformations()?.roleName ?? '');
        }
        /* update list permissions everytime user selects a new role */
        this.listPermissions.set(this.getPermissionsByRoleName(this.selectedRole()));
      },
      { allowSignalWrites: true },
    );
  }
  public readonly appDataSig = signal<CustomHttpResponse<Profile> | undefined>(undefined);
  @Input() public set appData(appData: CustomHttpResponse<Profile> | undefined) {
    this.appDataSig.set(appData);
  }
  public readonly dataStateSig = signal<DataState>(DataState.LOADED);
  @Input() public set dataState(dataState: DataState) {
    this.dataStateSig.set(dataState);
  }

  public readonly loadingSig = signal(false);
  @Input() public set loading(bool: boolean) {
    this.loadingSig.set(bool);
  }

  public readonly userProfileLoadedSig = signal(false);
  @Input() public set userProfileLoaded(bool: boolean) {
    this.userProfileLoadedSig.set(bool);
  }

  public readonly userInformations = signal<User | null>(null);
  @Input() public set userInfos(userInformations: User | null) {
    this.userInformations.set(userInformations);
  }

  @Output() public handleUserRoleChange = new EventEmitter<string>();

  //#region Roles
  public rolesListSig = computed(() => {
    return this.appDataSig()?.data?.roles ?? [];
  });

  public listPermissions = signal<string>('');
  public selectedRole = signal<string>('');

  public isSysAdminOrAdmin(): boolean {
    return this.userInformations()?.roleName === RoleEnum.ROLE_SYSADMIN || this.userInformations()?.roleName === RoleEnum.ROLE_ADMIN;
  }

  public getPermissionsByRoleName(roleName: string): string {
    return (this.appDataSig()?.data?.roles ?? [])
      .filter((role) => role.name === roleName)
      .map((role) => role.permission || '')
      .join(', ');
  }
  //#endregion

  public async updateUserRole(): Promise<void> {
    this.handleUserRoleChange.emit(this.selectedRole());
  }
}
