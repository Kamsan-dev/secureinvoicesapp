import { NgModule } from '@angular/core';
import { StatsComponent } from './stats.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';

@NgModule({
  declarations: [StatsComponent],
  imports: [CommonModule, ReactiveFormsModule, SeProgressSpinnerModule],
  exports: [StatsComponent],
})
export class StatsModule {}
