import { CommonModule } from '@angular/common';
import { EditCustomerComponent } from './edit/edit-customer.component';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared.module';
import { RouterModule } from '@angular/router';
import { DgdCoreCheckboxModule } from 'src/app/common/checkbox/dgd-core-checkbox.module';
import { NgModule } from '@angular/core';
import { CustomerRoutingModule } from './customer-routing.module';

@NgModule({
  declarations: [EditCustomerComponent],
  imports: [CommonModule, ReactiveFormsModule, SeProgressSpinnerModule, SharedModule, RouterModule, FormsModule, DgdCoreCheckboxModule, CustomerRoutingModule],
})
export class CustomerModule {}
