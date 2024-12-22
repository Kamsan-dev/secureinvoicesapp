import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditInvoiceComponent } from './edit/edit-invoice.component';
import { ListInvoiceComponent } from './list/list-invoice.component';

const routes: Routes = [
  {
    path: 'edit',
    component: EditInvoiceComponent,
  },
  {
    path: '',
    component: ListInvoiceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {}
