import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { UserService } from 'src/app/services/user.service';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  public close = signal(false);
  public sidebarService = inject(SidebarService);
  public responsiveService = inject(ResponsiveService);
  public userService = inject(UserService);
  public isOpen = signal(false);
  private destroy: Subject<void> = new Subject<void>();
  private router = inject(Router);

  public listLink = signal<{ label: string; route: string; icon: string }[]>([
    { label: 'Dashboard', route: '/dashboard', icon: 'fa-solid fa-chart-simple' },
    { label: 'Profile', route: '/profile', icon: 'fa-solid fa-user' },
    { label: 'Customers', route: '/customers', icon: 'fa-solid fa-users' },
    { label: 'Invoices', route: '/invoices', icon: 'fa-solid fa-file-invoice' },
  ]);

  public activatedLink = signal<string | null>(null);

  public ngOnInit(): void {
    // desktop sidebar handler
    this.sidebarService.sidebarState$.pipe(takeUntil(this.destroy)).subscribe((state) => {
      this.close.set(state);
    });

    // phone/tablet sidebar handler
    this.sidebarService.sidebarStatePhone$.pipe(takeUntil(this.destroy)).subscribe((state) => {
      this.isOpen.set(state);
    });

    // get current url route
    this.router.events
      .pipe(
        takeUntil(this.destroy),
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe(() => {
        this.activatedLink.set(this.router.url);
      });
  }

  public isActivated(route: string) {
    if (route === '/' || route === '') return this.activatedLink() === '/';
    else return this.activatedLink()?.startsWith(route);
  }

  public async logout(event: MouseEvent | TouchEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.userService.logout();
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
