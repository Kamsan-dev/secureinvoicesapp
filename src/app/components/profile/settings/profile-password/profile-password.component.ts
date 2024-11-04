import { booleanAttribute, ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataState } from 'src/app/enums/datastate.enum';

@Component({
  selector: 'se-profile-password',
  templateUrl: './profile-password.component.html',
  styleUrls: ['./profile-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePasswordComponent {
  private _passwordForm!: FormGroup;
  @Input() public set passwordForm(fg: FormGroup) {
    this._passwordForm = fg;
  }

  public readonly loadingSig = signal(false);
  @Input() public set loading(bool: boolean) {
    this.loadingSig.set(bool);
  }

  public readonly dataStateSig = signal<DataState>(DataState.LOADED);
  @Input() public set dataState(dataState: DataState) {
    this.dataStateSig.set(dataState);
  }

  public readonly passwordVerifiedSig = signal(false);
  @Input({ transform: booleanAttribute }) public set passwordVerified(bool: boolean) {
    this.passwordVerifiedSig.set(bool);
  }

  @Output() public verifyPassword = new EventEmitter<void>();
  @Output() public passwordFormSubmit = new EventEmitter<FormGroup>();

  //#region getter setter
  get passwordForm(): FormGroup {
    return this._passwordForm;
  }

  //region events handler
  public async onPasswordFormSubmit(event: TouchEvent | MouseEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.passwordFormSubmit.emit(this._passwordForm);
  }

  public async onVerifyPasswordButtonClick(event: TouchEvent | MouseEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.verifyPassword.emit();
  }
}
