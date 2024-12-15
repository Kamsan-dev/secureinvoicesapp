import { RouterModule, Routes } from '@angular/router';
import { EditCustomerComponent } from './edit/edit-customer.component';
import { NgModule } from '@angular/core';
import { ListCustomerComponent } from './list/list-customer.component';

const routes: Routes = [
  {
    path: 'edit',
    component: EditCustomerComponent,
  },
  {
    path: '',
    component: ListCustomerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
