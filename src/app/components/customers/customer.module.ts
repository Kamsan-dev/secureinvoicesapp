import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DgdCoreCheckboxModule } from 'src/app/common/checkbox/dgd-core-checkbox.module';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';
import { ExtractArrayValue } from 'src/app/pipes/extract-value.pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { CustomerRoutingModule } from './customer-routing.module';
import { EditCustomerComponent } from './edit/edit-customer.component';
import { ListCustomerComponent } from './list/list-customer.component';
import { ViewCustomerComponent } from './view/view-customer.component';
import { NavbarModule } from '../navbar/navbar.module';

@NgModule({
  declarations: [EditCustomerComponent, ListCustomerComponent, ViewCustomerComponent],
  imports: [ExtractArrayValue, SeProgressSpinnerModule, SharedModule, RouterModule, DgdCoreCheckboxModule, CustomerRoutingModule, NavbarModule],
})
export class CustomerModule {}
