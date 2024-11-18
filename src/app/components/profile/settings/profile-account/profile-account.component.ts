import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataState } from 'src/app/enums/datastate.enum';
import { RoleEnum } from 'src/app/interfaces/appstate';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'se-profile-account',
  templateUrl: './profile-account.component.html',
  styleUrls: ['./profile-account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileAccountComponent {
  private _accountSettingsForm!: FormGroup;
  @Input() public set accountSettingsForm(fg: FormGroup) {
    this._accountSettingsForm = fg;
  }

  public readonly dataStateSig = signal<DataState>(DataState.LOADED);
  @Input() public set dataState(dataState: DataState) {
    this.dataStateSig.set(dataState);
  }

  public readonly loadingSig = signal(false);
  @Input() public set loading(bool: boolean) {
    this.loadingSig.set(bool);
  }

  public readonly userInformations = signal<User | null>(null);
  @Input() public set userInfos(userInformations: User | null) {
    this.userInformations.set(userInformations);
  }

  @Output() public accountSettingsFormSubmitted = new EventEmitter<FormGroup>();

  //#region getter setter
  get accountSettingsForm(): FormGroup {
    return this._accountSettingsForm;
  }

  //region events
  public async onSettingsSubmit(event: MouseEvent | TouchEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.accountSettingsFormSubmitted.emit(this.accountSettingsForm);
  }

  public isSysAdminOrAdmin(): boolean {
    return this.userInformations()?.roleName === RoleEnum.ROLE_SYSADMIN || this.userInformations()?.roleName === RoleEnum.ROLE_ADMIN;
  }
}
