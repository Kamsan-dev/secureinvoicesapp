import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, delay, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ToasterService } from 'src/app/common/toaster/toaster.service';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomersPage } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer } from 'src/app/interfaces/customer.interface';
import { InvoiceResponse } from 'src/app/interfaces/invoice.interface';
import { State } from 'src/app/interfaces/state';
import { CustomerService } from 'src/app/services/customer.service';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditInvoiceComponent {
  public editInvoiceForm!: FormGroup;
  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();
  public invoiceState = signal<State<CustomHttpResponse<InvoiceResponse>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  // ng-select
  public customerFilterTerm = signal<string>('');
  public currentPage = signal(0);
  public searchTerm = signal<string>('');
  public lastCustomersPage = signal(Number.MAX_SAFE_INTEGER);
  public searchSubject = new Subject<string>();
  public customerState = signal<State<CustomHttpResponse<CustomersPage>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private invoiceService: InvoiceService,
    private toasterService: ToasterService,
  ) {}

  public ngOnInit(): void {
    this.editInvoiceForm = this.fb.group({
      services: [''],
      customerId: [''],
      issuedAt: [''],
      status: [''],
      total: [''],
    });

    //ng-select
    this.searchSubject.pipe(debounceTime(500), takeUntil(this.destroy), distinctUntilChanged()).subscribe((searchTerm) => {
      this.searchTerm.set(searchTerm);
      if (searchTerm !== '') {
        this.currentPage.set(0);
        this.loadCustomers();
      } else {
        this.currentPage.set(0);
        this.loadCustomers();
      }
    });

    // loading customers
    this.loadCustomers();
  }

  //#region customers
  public async loadCustomers(searchTerm?: string): Promise<void> {
    // No api call if we already have loaded all customers
    if (this.currentPage() <= this.lastCustomersPage()) {
      this.loading.set(true);
      try {
        const response = await lastValueFrom(this.customerService.searchCustomer(this.searchTerm(), this.currentPage(), 10));
        this.lastCustomersPage.set(response.data?.page.totalPages ? response.data.page.totalPages - 1 : 0);
        // on new search term registered and first page, we clear the customer list
        if (this.currentPage() === 0 && this.searchTerm() !== '') {
          this.customerState.set({
            ...this.customerState(),
            dataState: DataState.LOADED,
            appData: response,
          });
        } else {
          // otherwise, we concatenate results as we scroll down
          this.customerState.set({
            ...this.customerState(),
            dataState: DataState.LOADED,
            appData: {
              ...this.customerState().appData!,
              data: {
                ...this.customerState().appData?.data!,
                page: {
                  ...this.customerState().appData?.data?.page!,
                  content: [...(this.customerState().appData?.data?.page?.content || []), ...(response.data?.page.content || [])],
                },
              },
            },
          });
        }
        this.currentPage.set(this.currentPage() + 1);
      } catch (error) {
        if (error instanceof HttpErrorResponse) {
          this.customerState.set({
            ...this.customerState(),
            dataState: DataState.ERROR,
            error: error.error.reason,
          });
        }
      } finally {
        this.loading.set(false);
      }
    }
  }
  public getCustomersPage(): Customer[] {
    return (this.customerState().appData?.data?.page.content as Customer[]) || [];
  }

  //#region invoice

  public async onEditInvoiceSubmit(): Promise<void> {
    this.loading.set(true);
    this.editInvoiceForm.disable();
    this.editInvoiceForm.patchValue({
      issuedAt: `${this.editInvoiceForm.value.issuedAt}T00:00:00`,
    });
    try {
      const response = await lastValueFrom(this.invoiceService.editInvoice(this.editInvoiceForm.value.customerId, this.editInvoiceForm.value));
      this.invoiceState.set({
        ...this.invoiceState(),
        dataState: DataState.LOADED,
        appData: response,
      });
      this.toasterService.show('success', 'Success !', this.invoiceState().appData?.message ?? '');
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        this.invoiceState.set({
          ...this.invoiceState(),
          dataState: DataState.ERROR,
          error: error.error.reason,
        });
      }
    } finally {
      this.loading.set(false);
      this.editInvoiceForm.enable();
      this.editInvoiceForm.markAsPristine();
      this.editInvoiceForm.reset({ status: 'Pending' });
    }
  }

  //#region events

  public onClear(event: any): void {
    this.currentPage.set(0);
    this.searchSubject.next('');
    this.loadCustomers();
  }
  public onSearch(event: any): void {
    this.searchSubject.next(event.term); // Emit the search term to the Subject
  }
}
