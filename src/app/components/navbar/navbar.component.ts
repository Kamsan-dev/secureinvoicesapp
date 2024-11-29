import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  constructor(private userService: UserService) {}

  public readonly userInformations = signal<User | null>(null);
  @Input() public set userInfos(userInformations: User | null) {
    this.userInformations.set(userInformations);
  }

  public async logout(event: MouseEvent | TouchEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.userService.logout();
  }

  //#region UserInformations
  public getUserName(): string {
    return this.userInformations()?.firstName + ' ' + this.userInformations()?.lastName;
  }
  public getUserPictureProfile(): string {
    return this.userInformations()?.imageUrl || 'https://img.freepik.com/free-icon/user_318-159711.jpg';
  }
}
