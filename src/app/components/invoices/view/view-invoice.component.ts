import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { debounceTime, delay, distinctUntilChanged, filter, finalize, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer, ViewCustomer } from 'src/app/interfaces/customer.interface';
import { Invoice, InvoiceLine, InvoiceStatus, ViewInvoice } from 'src/app/interfaces/invoice.interface';
import { State } from 'src/app/interfaces/state';
import { InvoiceService } from 'src/app/services/invoice.service';
import { jsPDF as pdf } from 'jspdf';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CustomersPage } from 'src/app/interfaces/appstate';
import { CustomerService } from 'src/app/services/customer.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { BreadcrumbItem } from 'src/app/interfaces/common.interface';
import { ToasterService } from 'src/app/common/toaster/toaster.service';
import { ConfirmationService } from 'primeng/api';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewInvoiceComponent implements OnInit {
  public invoiceState = signal<State<CustomHttpResponse<ViewInvoice>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  //invoice
  public invoiceId = signal<number>(-1);
  public invoiceNumber = signal<string>('');
  private readonly INVOICE_ID = 'invoiceId';
  private readonly INVOICE_NUMBER = 'invoiceNumber';

  // form
  public vatRate = signal<number>(20.0);
  public editInvoiceForm!: FormGroup;
  private initialFormValue: any;
  public isInvoiceModified = signal(false);

  // flag

  private isInitialized = false;

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

  // tieredMenu
  public submenuItems = signal([
    {
      label: 'Product',
      icon: 'fa-solid fa-p',
      command: () => this.addInvoiceLine('PRODUCT'),
    },
    {
      label: 'Service',
      icon: 'fa-solid fa-s',
      command: () => this.addInvoiceLine('SERVICE'),
    },
  ]);

  //dropdwon invoice status
  public invoiceStatusItems = signal<InvoiceStatus[]>(['Pending', 'Paid', 'Overdue', 'Draft']);

  // breadcrumbs
  public items: BreadcrumbItem[] = [{ label: '', route: '/home', icon: 'pi pi-home' }, { label: 'Invoices', route: '/invoices' }, { label: 'curren-invoice' }];

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private invoiceService: InvoiceService,
    public responsiveService: ResponsiveService,
    private router: Router,
    private toasterService: ToasterService,
    private confirmationService: ConfirmationService,
  ) {}

  public ngOnInit(): void {
    console.log('InvoiceViewComponent initialized');
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

    // Get the id from the route
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const id = Number(params.get(this.INVOICE_ID));
      console.log('Received route ID:', id); // Debugging line
      const invoiceNumber = params.get(this.INVOICE_NUMBER);
      this.invoiceId.set(id);
      this.invoiceNumber.set(invoiceNumber || '');
      this.loadInvoiceData();
    });

    this.editInvoiceForm = this.fb.group({
      invoiceId: [''],
      invoiceNumber: [''],
      services: [''],
      customerId: [''],
      issuedAt: [''],
      dueAt: [''],
      status: [''],
      total: [''],
      totalVat: [''],
      isVatEnabled: [''],
      vatRate: [''],
      invoiceLines: this.fb.array([]),
    });

    // Subscribe to changes of 'isVatEnabled'
    this.editInvoiceForm
      .get('isVatEnabled')
      ?.valueChanges.pipe(takeUntil(this.destroy))
      .subscribe((enabled) => {
        // Once the invoice is loaded, we take the invoice vat rate as the default value.
        let defaultValue = this.initialFormValue ? this.initialFormValue.vatRate : 20.0;

        const defaultVatRate = enabled ? defaultValue : 0.0;

        this.editInvoiceForm.get('vatRate')?.setValue(defaultVatRate, { emitEvent: false });
        // we set the vat rate so we can compute the new price with tax.
        this.vatRate.set(defaultVatRate);
        // we can display the new price : no tax or with tax.
        const priceUpdated = enabled ? this.priceWithTax() : this.preTaxPrice();
        // we update our form with the new value
        this.editInvoiceForm.get('totalVat')?.setValue(priceUpdated, { emitEvent: false });
        this.isFormModified();
        console.log('isvatenabled listener');
      });

    // Subscribe to 'vatRate' changes
    this.editInvoiceForm
      .get('vatRate')
      ?.valueChanges.pipe(takeUntil(this.destroy), debounceTime(300))
      .subscribe((value) => {
        this.vatRate.set(value);
        this.editInvoiceForm.get('totalVat')?.setValue(this.priceWithTax(), { emitEvent: false });
        this.isFormModified();
        console.log('vatRate listener');
      });

    this.listenToInvoiceLinesChanges();

    this.editInvoiceForm.valueChanges.pipe(takeUntil(this.destroy), debounceTime(200)).subscribe((value) => {
      if (this.isInitialized) {
        console.log(value);
        const state = this.invoiceState();
        if (state.appData?.data?.invoice) {
          this.editInvoiceForm.get('issuedAt')?.setValue(value.issuedAt, { emitEvent: false });
          this.editInvoiceForm.get('dueAt')?.setValue(value.dueAt, { emitEvent: false });
          this.editInvoiceForm.get('status')?.setValue(value.status, { emitEvent: false });
          this.editInvoiceForm.get('services')?.setValue(value.services, { emitEvent: false });

          // Update invoice signals for the PDF preview.
          state.appData.data.invoice.issuedAt = value.issuedAt as Date;
          state.appData.data.invoice.dueAt = value.dueAt as Date;
          state.appData.data.invoice.status = value.status;
          this.isFormModified();
          console.log('updated form');
        }
      }
    });
  }

  private populateEditInvoiceForm(invoice: Invoice | null) {
    if (invoice) {
      this.editInvoiceForm.setValue(
        {
          customerId: invoice.customerId,
          invoiceId: invoice.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          services: invoice.services,
          issuedAt: new Date(invoice.issuedAt),
          dueAt: new Date(invoice.dueAt),
          status: invoice.status,
          total: invoice.total,
          totalVat: invoice.totalVat,
          isVatEnabled: invoice.isVatEnabled,
          vatRate: invoice.vatRate,
          invoiceLines: [],
        },
        { emitEvent: false },
      );

      if (invoice.invoiceLines?.length > 0) {
        const lineFG = invoice.invoiceLines.map((line) => {
          return this.fb.group({
            invoiceLineId: [line.invoiceLineId],
            description: [line.description],
            type: [line.type],
            duration: [line.duration],
            quantity: [line.quantity],
            price: [line.price],
            totalPrice: [line.totalPrice],
          });
        });
        const invoiceLinesFormArray = this.editInvoiceForm.get('invoiceLines') as FormArray;
        lineFG.forEach((line) => invoiceLinesFormArray.push(line));
        // Optionally: Set the value of the entire FormArray after adding FormGroups, preventing event emission
      }

      // Once we loaded the invoice data, we keep the origin copy as initialFormValue.
      this.initialFormValue = this.editInvoiceForm.value;
      // We update the vatrate & the pre-tax price
      this.vatRate.set(invoice.isVatEnabled ? invoice.vatRate : 0);
      this.preTaxPrice.set(invoice.total);
      // We update the totalVat.
      this.initialFormValue.totalVat = invoice.totalVat;
      console.log(this.editInvoiceForm.value);
    }
  }

  //#region forms

  public isFormModified(): void {
    this.isInvoiceModified.set(JSON.stringify(this.initialFormValue) !== JSON.stringify(this.editInvoiceForm.value));
  }

  public invoiceLines = computed(() => {
    return this.editInvoiceForm.get('invoiceLines') as FormArray;
  });

  public preTaxPrice = signal(0);

  public priceWithTax = computed(() => {
    return this.preTaxPrice() + this.tvaPrice();
  });

  public tvaPrice = computed(() => {
    return (this.preTaxPrice() * this.vatRate()) / 100;
  });

  private listenToInvoiceLinesChanges(): void {
    const invoiceLinesFormArray = this.editInvoiceForm.get('invoiceLines') as FormArray;

    invoiceLinesFormArray.valueChanges.pipe(takeUntil(this.destroy), debounceTime(300), distinctUntilChanged()).subscribe(() => {
      // using flag here because we dont need to calculate anything at the start of the life cycle of the component
      if (this.isInitialized) {
        console.log('invoiceLines');
        this.recalculateTotalPrice();
        console.log(this.editInvoiceForm.value);
        console.log(this.initialFormValue);
        this.isFormModified();
      } else {
        this.isInitialized = true;
      }
    });
  }

  // Calculate total price without tax then computed signals will update total price with tax.
  private recalculateTotalPrice(): number {
    const invoiceLinesFormArray = this.editInvoiceForm.get('invoiceLines') as FormArray;

    const total = invoiceLinesFormArray.controls.reduce((acc, line) => {
      const type = line.get('type')?.value;
      const multiplier = type === 'PRODUCT' ? line.get('quantity')?.value : line.get('duration')?.value;
      const price = line.get('price')?.value;
      const totalPrice = price * multiplier;
      line.get('totalPrice')?.setValue(totalPrice, { emitEvent: false });

      return acc + totalPrice;
    }, 0);

    console.log('Updated total:', total);
    // update in form price without tax
    this.editInvoiceForm.get('total')?.setValue(total, { emitEvent: false });
    this.preTaxPrice.set(total);
    console.log('price with tax : ', this.priceWithTax());
    // update in form price with tax
    this.editInvoiceForm.get('totalVat')?.setValue(this.priceWithTax(), { emitEvent: false });
    return total;
  }

  public onSaveInvoiceClick(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    this.loading.set(true);
    this.editInvoiceForm.disable({ emitEvent: false });
    this.invoiceState().dataState = DataState.LOADING;
    this.editInvoiceForm.get('status')?.patchValue(this.editInvoiceForm.get('status')?.value?.toUpperCase(), { emitEvent: false });
    console.log(this.editInvoiceForm.getRawValue());
    this.invoiceService
      .updateInvoice(this.invoiceId(), this.editInvoiceForm.getRawValue())
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
          this.editInvoiceForm.enable({ emitEvent: false });
          this.editInvoiceForm.markAsPristine();
          this.initialFormValue = this.editInvoiceForm.getRawValue();
          this.isFormModified();
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<ViewInvoice>) => {
          this.invoiceState().dataState = DataState.LOADED;
          this.toasterService.show('success', `Success !`, 'Invoice has been saved');
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

  public onResetInvoiceClick(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    this.editInvoiceForm.reset(this.initialFormValue, { emitEvent: false });
    this.invoiceLines().clear();
    this.initialFormValue.invoiceLines.forEach((line: InvoiceLine) => {
      const newLine = this.fb.group({
        invoiceLineId: [line.invoiceLineId],
        description: [line.description],
        type: [line.type],
        duration: [line.duration],
        quantity: [line.quantity],
        price: [line.price],
        totalPrice: [line.totalPrice],
      });
      this.invoiceLines().push(newLine);
    });
    this.isInvoiceModified.set(false);
  }

  public onDeleteInvoiceClick(event: MouseEvent | TouchEvent): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this invoice?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.deleteInvoiceById();
      },
      reject: () => {},
    });
  }

  // Button methods

  public removeInvoiceLine(index: number) {
    const invoiceLinesFormArray = this.editInvoiceForm.get('invoiceLines') as FormArray;
    invoiceLinesFormArray.removeAt(index);
    this.editInvoiceForm.markAsDirty();
  }

  public addInvoiceLine(value: 'PRODUCT' | 'SERVICE') {
    const invoiceLinesFormArray = this.editInvoiceForm.get('invoiceLines') as FormArray;
    const newLine = this.fb.group({
      description: [],
      type: [value],
      price: [],
      quantity: [null as number | null],
      duration: [null as number | null],
      totalPrice: [],
    });

    if (value === 'PRODUCT') {
      newLine.patchValue({
        quantity: 0,
      });
    } else {
      newLine.patchValue({
        duration: 0,
      });
    }

    invoiceLinesFormArray.push(newLine);
    this.editInvoiceForm.markAsDirty();
  }

  //#endregion

  //#region events

  public onCustomerSelectionChange(event: any): void {
    this.isFormModified();
    this.loading.set(true);
    this.invoiceState().dataState = DataState.LOADING;

    this.customerService
      .getCustomer(event.customerId)
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<ViewCustomer>) => {
          const state = this.invoiceState();
          if (state.appData?.data?.customer) {
            state.appData.data.customer = response.data?.customer as Customer;
            this.invoiceState().dataState = DataState.LOADED;
          }
        },
        error: (error: HttpErrorResponse) => {
          this.invoiceState.set({
            ...this.invoiceState(),
            dataState: DataState.ERROR,
            error: error.error.reason,
          });
        },
      });
  }

  public onClear(event: any): void {
    this.currentPage.set(0);
    this.searchSubject.next('');
    this.loadCustomers();
  }
  public onSearch(event: any): void {
    this.searchSubject.next(event.term); // Emit the search term to the Subject
  }

  //#endregion

  //#region customer

  public getCustomersPage(): Customer[] {
    return (this.customerState().appData?.data?.page.content as Customer[]) || [];
  }

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

  public getCustomer(): Customer | null {
    return this.invoiceState().appData?.data?.customer || null;
  }

  //#endregion

  //#region invoice

  public invoice = computed((): Invoice | null => {
    return this.invoiceState().appData?.data?.invoice || null;
  });

  private async loadInvoiceData() {
    this.loading.set(true);
    this.invoiceState().dataState = DataState.LOADING;

    this.invoiceService
      .getInvoice(this.invoiceId())
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<ViewInvoice>) => {
          this.invoiceState.set({
            ...this.invoiceState(),
            dataState: DataState.LOADED,
            appData: response,
          });

          this.populateEditInvoiceForm(this.invoice());
        },
        error: (error: HttpErrorResponse) => {
          this.invoiceState.set({
            ...this.invoiceState(),
            dataState: DataState.ERROR,
            error: error.error.reason,
          });
        },
      });
  }

  private deleteInvoiceById(): void {
    this.loading.set(true);
    this.invoiceState().dataState = DataState.LOADING;

    this.invoiceService
      .deleteInvoice(this.invoiceId())
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<void>) => {
          this.toasterService.show('success', `Success !`, 'Invoice has been deleted successfully');
          this.router.navigate(['invoices']);
        },
        error: (error: HttpErrorResponse) => {
          this.invoiceState.set({
            ...this.invoiceState(),
            dataState: DataState.ERROR,
            error: error.error.reason,
          });
          this.toasterService.show('error', `Something went wrong !`, '');
        },
      });
  }

  //#endregion

  //region export

  public exportAsPDF(): void {
    const filename = `invoice-${this.invoiceNumber()}-${this.getCustomer()?.name}.pdf`;
    const doc = new pdf();
    doc.html(document.getElementById('invoice') as HTMLElement, { margin: 5, windowWidth: 1000, width: 200, callback: (invoice) => invoice.save(filename) });
  }
  //#endregion
}
