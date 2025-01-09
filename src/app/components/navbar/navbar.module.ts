import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavbarComponent } from './navbar.component';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [NavbarComponent],
  imports: [SharedModule, InputTextModule],
  exports: [NavbarComponent],
})
export class NavbarModule {}
