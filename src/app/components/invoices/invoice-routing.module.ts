import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditInvoiceComponent } from './edit/edit-invoice.component';

const routes: Routes = [
  {
    path: 'edit',
    component: EditInvoiceComponent,
  },
  //   {
  //     path: 'view/:id',
  //     component: ViewCustomerComponent,
  //   },
  //   {
  //     path: '',
  //     component: ListCustomerComponent,
  //   },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceRoutingModule {}
