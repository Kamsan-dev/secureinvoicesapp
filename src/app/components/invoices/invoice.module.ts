import { NgModule } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'src/app/shared/shared.module';
import { SeProgressSpinnerModule } from '../../common/progress-spinner/se-progress-spinner.module';
import { EditInvoiceComponent } from './edit/edit-invoice.component';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { ListInvoiceComponent } from './list/list-invoice.component';
import { ViewInvoiceComponent } from './view/view-invoice.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@NgModule({
  declarations: [EditInvoiceComponent, ListInvoiceComponent, ViewInvoiceComponent],
  imports: [
    InvoiceRoutingModule,
    SharedModule,
    NgSelectModule,
    TableModule,
    SeProgressSpinnerModule,
    CalendarModule,
    InputSwitchModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    TieredMenuModule,
    BreadcrumbModule,
  ],
})
export class InvoiceModule {}
