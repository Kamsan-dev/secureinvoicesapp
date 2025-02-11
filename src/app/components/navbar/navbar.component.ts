import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { ResponsiveService } from 'src/app/services/responsive.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy: Subject<void> = new Subject<void>();

  public readonly userInformations = signal<User | null>(null);
  @Input() public set userInfos(userInformations: User | null) {
    this.userInformations.set(userInformations);
  }

  // STYLE
  public readonly SIDEBAR_WIDTH = 270;
  public readonly SIDEBAR_CLOSE_WIDTH = 88;
  public pageMarginLeft = signal(this.SIDEBAR_WIDTH);

  constructor(
    private userService: UserService,
    private sidebarService: SidebarService,
    public responsiveService: ResponsiveService,
  ) {}

  public ngOnInit(): void {
    if (this.userService.isAuthenticated()) {
      this.userService
        .profile()
        .pipe(takeUntil(this.destroy))
        .subscribe((profile) => {
          this.userInformations.set(profile.data?.user || null);
        });
    }
    this.userService.user$.pipe(takeUntil(this.destroy)).subscribe((user) => {
      this.userInformations.set(user);
    });

    /* Sidebar responsiveness */
    this.sidebarService.sidebarState$.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.pageMarginLeft.set(this.sidebarService.getSidebarWidth());
    });

    // handle transition desktop to phone window
    this.responsiveService
      .observe()
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        if (this.responsiveService.phone()) {
          this.pageMarginLeft.set(0);
        }
      });
  }

  public async logout(event: MouseEvent | TouchEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.userService.logout();
  }

  public async onToggleClick(event: MouseEvent | TouchEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.sidebarService.toggleSidebar();
  }

  //#region UserInformations
  public getUserName(): string {
    return this.userInformations()?.firstName + ' ' + this.userInformations()?.lastName;
  }
  public getUserPictureProfile(): string {
    return this.userInformations()?.imageUrl || 'https://img.freepik.com/free-icon/user_318-159711.jpg';
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
