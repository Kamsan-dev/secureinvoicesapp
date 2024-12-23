import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditInvoiceComponent } from './edit/edit-invoice.component';
import { ListInvoiceComponent } from './list/list-invoice.component';
import { ViewInvoiceComponent } from './view/view-invoice.component';

const routes: Routes = [
  {
    path: 'edit',
    component: EditInvoiceComponent,
  },
  {
    path: '',
    component: ListInvoiceComponent,
  },
  {
    path: 'view/:invoiceId/:invoiceNumber',
    component: ViewInvoiceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {}
