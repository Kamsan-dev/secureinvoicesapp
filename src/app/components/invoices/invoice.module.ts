import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditInvoiceComponent } from './edit/edit-invoice.component';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ListInvoiceComponent } from './list/list-invoice.component';
import { SeProgressSpinnerModule } from '../../common/progress-spinner/se-progress-spinner.module';
import { ViewInvoiceComponent } from './view/view-invoice.component';
@NgModule({
  declarations: [EditInvoiceComponent, ListInvoiceComponent, ViewInvoiceComponent],
  imports: [CommonModule, InvoiceRoutingModule, FormsModule, ReactiveFormsModule, SharedModule, NgSelectModule, SeProgressSpinnerModule],
})
export class InvoiceModule {}
