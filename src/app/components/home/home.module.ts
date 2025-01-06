import { NgModule } from '@angular/core';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { StatsModule } from '../stats/stats.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [SharedModule, HomeRoutingModule, StatsModule, SeProgressSpinnerModule, StatsModule],
})
export class HomeModule {}
