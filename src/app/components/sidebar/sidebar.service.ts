import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResponsiveService } from 'src/app/services/responsive.service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private isSidebarClose = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.isSidebarClose.asObservable();

  public toggleSidebar(): void {
    this.isSidebarClose.next(!this.isSidebarClose.value);
  }

  public getSidebarWidth(): number {
    if (this.responsiveService.phone()) return 0;
    return this.isSidebarClose.value ? 88 : 270;
  }

  constructor(private responsiveService: ResponsiveService) {}
}
