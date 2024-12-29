import { RouterModule, Routes } from '@angular/router';
import { EditCustomerComponent } from './edit/edit-customer.component';
import { NgModule } from '@angular/core';
import { ListCustomerComponent } from './list/list-customer.component';
import { ViewCustomerComponent } from './view/view-customer.component';

const customerRoutes: Routes = [
  {
    path: 'edit',
    component: EditCustomerComponent,
  },
  {
    path: 'view/:id',
    component: ViewCustomerComponent,
  },
  {
    path: '',
    component: ListCustomerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(customerRoutes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
