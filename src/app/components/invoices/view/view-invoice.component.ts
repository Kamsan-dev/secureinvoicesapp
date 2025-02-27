import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, delay, distinctUntilChanged, finalize, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer, ViewCustomer } from 'src/app/interfaces/customer.interface';
import { Invoice, ViewInvoice } from 'src/app/interfaces/invoice.interface';
import { State } from 'src/app/interfaces/state';
import { InvoiceService } from 'src/app/services/invoice.service';
import { jsPDF as pdf } from 'jspdf';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CustomersPage } from 'src/app/interfaces/appstate';
import { CustomerService } from 'src/app/services/customer.service';

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

  // summary information
  public vatRate = signal<number>(20.0);
  public editInvoiceForm!: FormGroup;

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

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private invoiceService: InvoiceService,
    private router: Router,
  ) {}

  public ngOnInit(): void {
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
        const defaultVatRate = enabled ? 20.0 : 0.0;
        this.editInvoiceForm.get('vatRate')?.setValue(defaultVatRate, { emitEvent: false });
        this.vatRate.set(defaultVatRate);
        const priceUpdated = enabled ? this.priceWithTax() : this.preTaxPrice();
        console.log('price updated: ' + priceUpdated);
        this.editInvoiceForm.get('totalVat')?.setValue(priceUpdated, { emitEvent: false });
      });

    // Subscribe to 'vatRate' changes
    this.editInvoiceForm
      .get('vatRate')
      ?.valueChanges.pipe(takeUntil(this.destroy), debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.vatRate.set(value); // Sync with your vatRate model
        this.preTaxPrice.set(this.recalculateTotalPrice());
        this.editInvoiceForm.get('totalVat')?.setValue(this.priceWithTax(), { emitEvent: false });
      });

    this.listenToInvoiceLinesChanges();
  }

  private populateEditInvoiceForm(invoice: Invoice | null) {
    if (invoice) {
      this.editInvoiceForm.setValue({
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
      });

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
      }

      this.preTaxPrice.update((value): number => {
        return this.recalculateTotalPrice();
      });
    }
  }

  //#region forms

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
      this.recalculateTotalPrice();
    });
  }

  private recalculateTotalPrice(): number {
    const invoiceLinesFormArray = this.editInvoiceForm.get('invoiceLines') as FormArray;

    const total = invoiceLinesFormArray.controls.reduce((acc, line) => {
      const type = line.get('type')?.value;
      const multiplier = type === 'PRODUCT' ? line.get('quantity')?.value : line.get('duration')?.value;
      const price = line.get('price')?.value;
      line.get('totalPrice')?.setValue(price * multiplier, { emitEvent: false });

      return acc + (price ?? 0) * (multiplier ?? 0);
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

  // Button methods

  public removeInvoiceLine(index: number) {
    const invoiceLinesFormArray = this.editInvoiceForm.get('invoiceLines') as FormArray;
    invoiceLinesFormArray.removeAt(index);
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
  }

  //#endregion

  //#region events

  public onCustomerSelectionChange(event: any): void {
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

  public getServices(): string[] {
    return (
      this.invoiceState()
        .appData?.data?.invoice.services.split(',')
        .map((service) => service.trim()) || []
    );
  }

  public getAmountOfService(service: string): string {
    const tab = service.split(' ');
    return tab[tab.length - 1];
  }

  public getLabelOfService(service: string): string {
    const tab = service.split(' ');
    return tab.slice(0, tab.length - 1).join(' '); // Join everything except the last part
  }

  public getSubTotal(): number {
    const total = this.getServices()
      .map((service) => {
        const amount = this.getAmountOfService(service);
        return parseFloat(amount.replace('$', '')); // Remove '$' and convert to a number
      })
      .reduce((sum, amount) => sum + amount, 0);
    return total;
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
