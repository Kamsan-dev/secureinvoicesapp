import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { SidebarService } from './components/sidebar/sidebar.service';
import { Subject, takeUntil } from 'rxjs';
import { ResponsiveService } from './services/responsive.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'secureinvoicesapp';
  private static readonly SIDEBAR_WIDTH = 270;
  public pageMarginLeft = signal(AppComponent.SIDEBAR_WIDTH);
  private destroy: Subject<void> = new Subject<void>();

  constructor(
    private primengConfig: PrimeNGConfig,
    private sidebarService: SidebarService,
    public responsiveService: ResponsiveService,
    public userService: UserService,
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.sidebarService.sidebarState$.pipe(takeUntil(this.destroy)).subscribe(() => {
      this.pageMarginLeft.set(this.sidebarService.getSidebarWidth());
    });
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
