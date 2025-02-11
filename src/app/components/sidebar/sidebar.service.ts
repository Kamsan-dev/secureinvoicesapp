import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResponsiveService } from 'src/app/services/responsive.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  // desktop
  private isSidebarClose = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.isSidebarClose.asObservable();

  // phone/tablet

  private isSidebarOpen = new BehaviorSubject<boolean>(false);
  sidebarStatePhone$ = this.isSidebarOpen.asObservable();

  public toggleSidebar(): void {
    if (this.responsiveService.phone() || this.responsiveService.tablet()) {
      this.isSidebarOpen.next(!this.isSidebarOpen.value);
      return;
    }
    this.isSidebarClose.next(!this.isSidebarClose.value);
  }

  public getSidebarWidth(): number {
    if (this.responsiveService.phone() || this.responsiveService.tablet()) return 0;
    return this.isSidebarClose.value ? 88 : 270;
  }

  constructor(private responsiveService: ResponsiveService) {}
}
