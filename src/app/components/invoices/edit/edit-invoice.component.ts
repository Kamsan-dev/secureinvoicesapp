import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { delay, lastValueFrom } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomersPage } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer } from 'src/app/interfaces/customer.interface';
import { State } from 'src/app/interfaces/state';
import { CustomerService } from 'src/app/services/customer.service';

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditInvoiceComponent {
  public editInvoiceForm!: FormGroup;
  public async onEditInvoiceSubmit(): Promise<void> {}
  public loading = signal(false);
  // public invoiceState = signal<State<CustomHttpResponse<CustomersPage>>>({
  //   dataState: DataState.LOADED,
  //   appData: undefined,
  //   error: undefined,
  // });

  // ng-select
  public customerFilterTerm = signal<string>('');
  public currentPage = signal(0);
  public lastCustomersPage = signal(Number.MAX_SAFE_INTEGER);
  public customerState = signal<State<CustomHttpResponse<CustomersPage>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
  ) {}

  public ngOnInit(): void {
    this.editInvoiceForm = this.fb.group({
      service: [''],
      customer: [''],
      issuedAt: [''],
      status: [''],
      total: [''],
    });

    // loading customers
    this.loadCustomers();
  }

  public async loadCustomers(): Promise<void> {
    // No api call if we already have loaded all customers
    if (this.currentPage() > this.lastCustomersPage()) return;
    this.loading.set(true);
    let page = this.currentPage();
    try {
      const response = await lastValueFrom(this.customerService.searchCustomer('', page++, 10));
      const newCustomers = response.data?.page.content || [];
      const currentCustomers = this.customerState().appData?.data?.page?.content || [];

      this.lastCustomersPage.set(response.data?.page.totalPages ? response.data.page.totalPages - 1 : 0);
      console.log(response);
      this.customerState.set({
        ...this.customerState(),
        dataState: DataState.LOADED,
        appData: {
          ...this.customerState().appData!,
          data: {
            ...this.customerState().appData?.data!,
            page: {
              ...this.customerState().appData?.data?.page!,
              content: [...currentCustomers, ...newCustomers],
            },
          },
        },
      });
      this.currentPage.set(page);
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.customerState.set({
          ...this.customerState(),
          dataState: DataState.ERROR,
          error: error.error.reason,
        });
      } else {
        console.log('An unknown error occurred', error);
      }
    } finally {
      this.loading.set(false);
    }
  }

  public searchCustomers(event: any): void {
    console.log(event);
  }

  public getCustomersPage(): Customer[] {
    return (this.customerState().appData?.data?.page.content as Customer[]) || [];
  }
}
