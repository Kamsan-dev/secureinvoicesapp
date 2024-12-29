import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { SeProgressSpinnerModule } from '../../common/progress-spinner/se-progress-spinner.module';
import { EditInvoiceComponent } from './edit/edit-invoice.component';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { ListInvoiceComponent } from './list/list-invoice.component';
import { ViewInvoiceComponent } from './view/view-invoice.component';
import { NavbarModule } from '../navbar/navbar.module';
@NgModule({
  declarations: [EditInvoiceComponent, ListInvoiceComponent, ViewInvoiceComponent],
  imports: [InvoiceRoutingModule, SharedModule, NgSelectModule, SeProgressSpinnerModule, NavbarModule],
})
export class InvoiceModule {}
