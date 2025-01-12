import { NgModule } from '@angular/core';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { StatsComponent } from './stats.component';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';

@NgModule({
  declarations: [StatsComponent],
  imports: [SharedModule, SeProgressSpinnerModule, PanelModule, CardModule, ChartModule],
  exports: [StatsComponent],
})
export class StatsModule {}
