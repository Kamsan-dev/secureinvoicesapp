import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataState } from 'src/app/enums/datastate.enum';
import { Profile } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'se-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileInfoComponent {
  private _profileForm!: FormGroup;
  @Input() public set profileForm(fg: FormGroup) {
    this._profileForm = fg;
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

  public readonly userInformations = signal<User | null>(null);
  @Input() public set userInfos(userInformations: User | null) {
    this.userInformations.set(userInformations);
  }

  @Output() public undoFormProfileChanges = new EventEmitter<void>();
  @Output() public profileFormSubmitted = new EventEmitter<FormGroup>();
  //#region getter setter
  get profileForm(): FormGroup {
    return this._profileForm;
  }

  //#endregion

  //region events handler
  public async onProfileSubmit(event: TouchEvent | MouseEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.profileFormSubmitted.emit(this._profileForm);
  }
  public async onCancelUserProfileChanges(event: TouchEvent | MouseEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.undoFormProfileChanges.emit();
  }
  //#endregion
}
