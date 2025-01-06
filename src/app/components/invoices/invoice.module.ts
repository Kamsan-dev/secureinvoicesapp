import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { SeProgressSpinnerModule } from '../../common/progress-spinner/se-progress-spinner.module';
import { EditInvoiceComponent } from './edit/edit-invoice.component';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { ListInvoiceComponent } from './list/list-invoice.component';
import { ViewInvoiceComponent } from './view/view-invoice.component';
@NgModule({
  declarations: [EditInvoiceComponent, ListInvoiceComponent, ViewInvoiceComponent],
  imports: [InvoiceRoutingModule, SharedModule, NgSelectModule, SeProgressSpinnerModule],
})
export class InvoiceModule {}
