import { RouterModule, Routes } from '@angular/router';
import { EditCustomerComponent } from './edit/edit-customer.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
  {
    path: 'edit',
    component: EditCustomerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule {}
