import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home/home.component';
import { NavbarModule } from '../navbar/navbar.module';
import { StatsModule } from '../stats/stats.module';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [SharedModule, HomeRoutingModule, NavbarModule, StatsModule, SeProgressSpinnerModule, StatsModule],
})
export class HomeModule {}
