import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { PersistanceService } from 'src/app/services/persistance.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  constructor(
    private persistanceService: PersistanceService,
    private router: Router,
  ) {}

  public async logout(event: MouseEvent | TouchEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.persistanceService.remove('refresh-token');
    this.persistanceService.remove('access-token');
    this.router.navigate(['login']);
  }
}
