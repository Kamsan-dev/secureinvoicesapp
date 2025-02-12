import { NgModule } from '@angular/core';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { StatsComponent } from './stats.component';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ListInvoiceDialogComponent } from './dialog/list-invoice-dialog.component';

@NgModule({
  declarations: [StatsComponent],
  providers: [DialogService],
  imports: [SharedModule, SeProgressSpinnerModule, PanelModule, CardModule, DynamicDialogModule, ListInvoiceDialogComponent],
  exports: [StatsComponent],
})
export class StatsModule {}
