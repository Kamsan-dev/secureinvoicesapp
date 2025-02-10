import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { SidebarService } from './sidebar.service';
import { ResponsiveService } from 'src/app/services/responsive.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit {
  public close = signal(false);
  private sidebarService = inject(SidebarService);
  public responsiveService = inject(ResponsiveService);

  ngOnInit() {
    this.sidebarService.sidebarState$.subscribe((state) => {
      this.close.set(state);
    });
  }
}
