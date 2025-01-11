import { NgModule } from '@angular/core';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { StatsComponent } from './stats.component';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';

@NgModule({
  declarations: [StatsComponent],
  imports: [SharedModule, SeProgressSpinnerModule, PanelModule, CardModule],
  exports: [StatsComponent],
})
export class StatsModule {}
