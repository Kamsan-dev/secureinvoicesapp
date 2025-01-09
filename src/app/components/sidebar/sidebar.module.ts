import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { SidebarComponent } from './sidebar.component';

@NgModule({
  declarations: [SidebarComponent],
  imports: [SharedModule],
  exports: [SidebarComponent],
})
export class SidebarModule {}
