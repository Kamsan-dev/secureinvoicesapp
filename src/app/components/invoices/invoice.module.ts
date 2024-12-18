import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditInvoiceComponent } from './edit/edit-invoice.component';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [EditInvoiceComponent],
  imports: [CommonModule, InvoiceRoutingModule, FormsModule, ReactiveFormsModule, SharedModule, NgSelectModule],
})
export class InvoiceModule {}
