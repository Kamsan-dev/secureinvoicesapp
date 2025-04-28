import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, finalize, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ToasterService } from 'src/app/common/toaster/toaster.service';
import { CUSTOMER_STATUS_ITEMS, CUSTOMER_TYPE_ITEMS, CustomerStatusEnum, CustomerTypeEnum, LabelValueFilter } from 'src/app/enums/customer.enum';
import { DataState } from 'src/app/enums/datastate.enum';
import { InvoicesPage } from 'src/app/interfaces/appstate';
import { BreadcrumbItem } from 'src/app/interfaces/common.interface';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer, ViewCustomer } from 'src/app/interfaces/customer.interface';
import { Invoice } from 'src/app/interfaces/invoice.interface';
import { State } from 'src/app/interfaces/state';
import { CustomerService } from 'src/app/services/customer.service';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-view-customer',
  templateUrl: './view-customer.component.html',
  styleUrls: ['./view-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCustomerComponent implements OnInit {
  public customerState = signal<State<CustomHttpResponse<ViewCustomer>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public invoiceState = signal<State<CustomHttpResponse<InvoicesPage>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  //customer
  public customerId = signal<number>(-1);
  private readonly CUSTOMER_ID = 'id';
  public customer = signal<Customer | null>(null);

  //invoices
  public invoicesPage = signal<Invoice[]>([]);
  //pagination
  public currentPage = signal<number>(0);
  public totalRecords = signal(0);
  public pageSize = signal(10);
  public first = signal(0);

  //dropdown customer type & status
  public customerTypeItems = signal<LabelValueFilter<CustomerTypeEnum>[]>(CUSTOMER_TYPE_ITEMS);
  public customerStatusItems = signal<LabelValueFilter<CustomerStatusEnum>[]>(CUSTOMER_STATUS_ITEMS);

  // breadcrumbs
  public breadcrumbsItems = signal<BreadcrumbItem[]>([{ label: '', route: '/home', icon: 'pi pi-home' }, { label: 'Customers', route: '/customers' }, { label: '' }]);

  //form
  public customerForm!: FormGroup;
  private initialFormValue: any;

  public readonly DataState = DataState;

  constructor(
    private customerService: CustomerService,
    private invoiceService: InvoiceService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private toasterService: ToasterService,
  ) {}

  public ngOnInit(): void {
    // Get the id from the route
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const id = Number(params.get(this.CUSTOMER_ID));
      this.customerId.set(id);
      this.loadCustomerData();
    });

    // Listen for query parameter changes
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const newPage = Number(params['page']) || 0;
      this.currentPage.set(newPage);
      this.loadInvoicesByCustomer();
    });

    this.customerForm = this.fb.group({
      customerId: [''],
      name: [''],
      email: [''],
      imageUrl: [''],
      type: [''],
      status: [''],
      address: [''],
      phone: [''],
      createdAt: [''],
    });

    this.customerForm.disable();
  }

  //#region customer

  public async loadCustomerData(): Promise<void> {
    this.loading.set(true);
    this.customerState().dataState = DataState.LOADING;
    try {
      const response = await lastValueFrom(this.customerService.getCustomer(this.customerId()).pipe(delay(200)));
      this.customerState.set({
        ...this.customerState(),
        dataState: DataState.LOADED,
        appData: response,
      });
      this.customer.set(response.data?.customer || null);
      this.populateForm();
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

  public async onUpdateCustomer(event: MouseEvent | TouchEvent): Promise<void> {
    event.stopImmediatePropagation();
    this.loading.set(true);
    this.customerForm.disable();
    try {
      const response = await lastValueFrom(this.customerService.updateCustomer(this.customerForm.value));
      this.customerState.set({
        ...this.customerState(),
        dataState: DataState.LOADED,
        appData: response,
      });
      this.customer.set(response.data?.customer || null);
      this.toasterService.show('success', 'Success !', this.customerState().appData?.message ?? '');
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
      this.customerForm.disable();
      this.customerForm.markAsPristine();
    }
  }

  private populateForm(): void {
    const customer = this.customer();

    if (customer) {
      this.customerForm.setValue({
        customerId: customer.customerId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        type: customer.type,
        status: customer.status,
        createdAt: customer.createdAt || '',
        imageUrl: customer.imageUrl,
      });
    }

    this.initialFormValue = this.customerForm.value;
  }

  //#region invoices

  private loadInvoicesByCustomer() {
    this.loading.set(true);
    this.invoiceState().dataState = DataState.LOADING;
    this.invoiceService
      .getInvoicesByCustomerId(this.customerId(), this.currentPage(), this.pageSize())
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<InvoicesPage>) => {
          this.invoiceState().dataState = DataState.LOADED;
          const content = response?.data?.page?.content || [];
          const totalElements = response.data?.page?.totalElements || 0;
          this.totalRecords.set(totalElements);
          // If no customers are found on the given page and there are customers to display,
          // we load the last valid page of data
          if (content.length === 0 && totalElements > 0) {
            const lastPage = response.data?.page?.totalPages ? response.data.page.totalPages - 1 : 0;
            this.currentPage.set(lastPage);
            this.router.navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: { page: lastPage },
              queryParamsHandling: 'merge',
            });
          }

          this.invoicesPage.set(content);
        },
        error: (error: HttpErrorResponse) => {
          this.invoiceState.set({
            ...this.invoiceState(),
            dataState: DataState.ERROR,
            error: error.error.reason,
          });
          this.toasterService.show('error', 'Something went wrong !', 'An error occured when saving the invoice.');
        },
      });
  }

  //#endregion

  //#region event

  public onEditCustomerForm(event: TouchEvent | MouseEvent) {
    event.stopImmediatePropagation();
    this.customerForm.enable();
  }

  public onCancelEditForm(event: TouchEvent | MouseEvent) {
    event.stopImmediatePropagation();
    this.customerForm.reset(this.initialFormValue, { emitEvent: false });
    this.customerForm.disable();
  }

  public onRedirectToInvoice(invoiceId: number, invoiceNumber: string): void {
    this.router.navigate(['/invoices/view', invoiceId, invoiceNumber]);
  }

  //#region pagination

  public onPageChange(event: any): void {
    this.currentPage.set(event.page);
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: this.currentPage() },
      queryParamsHandling: 'merge',
    });
  }

  public getShowingRange = computed(() => {
    let start = this.currentPage() * this.pageSize() + 1;
    let end = start + this.pageSize() - 1;

    return `Showing ${start} to ${end} of ${this.totalRecords()} results`;
  });
}
