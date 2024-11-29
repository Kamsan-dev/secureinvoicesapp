import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { DataState } from 'src/app/enums/datastate.enum';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'se-profile-authentication',
  templateUrl: './profile-authentication.component.html',
  styleUrls: ['./profile-authentication.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileAuthenticationComponent {
  public showLastestActivities: boolean = true;
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

  @Output() public authenticationSettingsUpdated = new EventEmitter<void>();
  @Output() public showActivityLogsUpdated = new EventEmitter<boolean>();

  public async onUpdateMfa(event: MouseEvent | TouchEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.authenticationSettingsUpdated.emit();
  }

  public getMfaStatus(): any {
    const usingMfa = this.userInformations()?.usingMfa;
    return {
      text: usingMfa ? 'Enabled' : 'Disabled',
      class: usingMfa ? 'bg-success' : 'bg-warning',
    };
  }

  public onShowLastestActivitiesChange(): void {
    this.showLastestActivities = !this.showLastestActivities;
    this.showActivityLogsUpdated.emit(this.showLastestActivities);
  }
}
