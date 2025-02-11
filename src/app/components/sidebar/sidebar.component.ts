import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { SidebarService } from './sidebar.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { Subject, takeUntil } from 'rxjs';

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
  public isOpen = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  ngOnInit() {
    // desktop sidebar handler
    this.sidebarService.sidebarState$.pipe(takeUntil(this.destroy)).subscribe((state) => {
      this.close.set(state);
    });

    // phone/tablet sidebar handler
    this.sidebarService.sidebarStatePhone$.pipe(takeUntil(this.destroy)).subscribe((state) => {
      this.isOpen.set(state);
    });
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
