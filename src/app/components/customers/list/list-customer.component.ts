import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';
import { CUSTOMER_STATUS_ITEMS_FILTERS, CUSTOMER_TYPE_ITEMS_FILTERS } from 'src/app/enums/customer.enum';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomersPage } from 'src/app/interfaces/appstate';
import { BreadcrumbItem } from 'src/app/interfaces/common.interface';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer } from 'src/app/interfaces/customer.interface';
import { State } from 'src/app/interfaces/state';
import { CustomerService } from 'src/app/services/customer.service';
import { ResponsiveService } from 'src/app/services/responsive.service';
import { EditCustomerDialogComponent } from '../dialog/edit-customer-dialog/edit-customer-dialog.component';

@Component({
  selector: 'app-list-customer',
  templateUrl: './list-customer.component.html',
  styleUrls: ['./list-customer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListCustomerComponent implements OnInit, OnDestroy {
  public customerState = signal<State<CustomHttpResponse<CustomersPage>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public customersPage = signal<Customer[]>([]);
  public readonly DataState = DataState;
  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  //filter
  //public nameFilter = signal<string>('');
  public searchCustomerByNameSubject = new Subject<string>();
  public customerTypeItems = CUSTOMER_TYPE_ITEMS_FILTERS;
  public customerStatusItems = CUSTOMER_STATUS_ITEMS_FILTERS;

  public customersFilters = {
    customerType: signal(this.customerTypeItems().at(0)?.value),
    customerStatus: signal(this.customerStatusItems().at(0)?.value),
    name: signal(''),
  };

  //pagination
  public currentPage = signal<number>(0);
  public totalRecords = signal(0);
  public pageSize = signal(10);
  public first = signal(0);

  // breadcrumbs
  public breadcrumbsItems = signal<BreadcrumbItem[]>([{ label: '', route: '/home', icon: 'pi pi-home' }, { label: 'Customers' }]);

  // selectButton
  public displayModeOptions = signal([
    { icon: 'fa-solid fa-table', value: 'table' },
    { icon: 'fa-solid fa-grip', value: 'card' },
  ]);

  public displayMode = signal<'table' | 'card'>('table');

  private isInitialLoad = true;

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public responsiveService: ResponsiveService,
    private dialogService: DialogService,
  ) {}
  public ngOnInit(): void {
    // Read query params immediately on initialization
    this.customersFilters.name.set(this.route.snapshot.queryParamMap.get('name') || '');
    let pageSnapshot = this.route.snapshot.queryParamMap.get('page');
    this.currentPage.set(pageSnapshot ? parseInt(pageSnapshot, 10) : 0);
    this.first.set(this.currentPage() * this.pageSize());

    // Observable to handle the search debounce
    this.searchCustomerByNameSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy)).subscribe((filter: string) => {
      // Update the query params in the URL and reset the page to 0
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { name: filter || null, page: 0 },
        queryParamsHandling: 'merge',
      });
    });

    // Listen for query parameter changes
    this.route.queryParams.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const newName = params['name'] || '';
      const newPage = Number(params['page']) || 0;
      const newType = params['type'] || this.customerTypeItems().at(0)?.value;
      const newStatus = params['status'] || this.customerStatusItems().at(0)?.value;

      const nameChanged = newName !== this.customersFilters.name();
      const typeChanged = newType !== this.customersFilters.customerType();
      const statusChanged = newStatus !== this.customersFilters.customerStatus();
      // const pageChanged = newPage !== this.currentPage();

      if (nameChanged) {
        this.customersFilters.name.set(newName);
      }
      if (typeChanged) {
        this.customersFilters.customerType.set(newType);
      }
      if (statusChanged) {
        this.customersFilters.customerStatus.set(newStatus);
      }

      if (this.isInitialLoad) {
        this.isInitialLoad = false;
        this.loadCustomersWithFilterSearch();
        return;
      }

      if (nameChanged || typeChanged || statusChanged) {
        this.currentPage.set(0);
        this.loadCustomersWithFilterSearch();
      } else if (this.currentPage() !== newPage) {
        this.currentPage.set(newPage);
        this.loadCustomersWithFilterSearch();
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  //#endregion

  //#region Customers

  public selectCustomer(id: number): void {
    this.router.navigate(['/customers/view/' + id]);
  }

  private loadCustomersWithFilterSearch(): void {
    this.customerState().dataState = DataState.LOADING;
    this.loading.set(true);
    this.customerService
      .searchCustomer(this.customersFilters.name(), this.customersFilters.customerType(), this.customersFilters.customerStatus(), this.currentPage(), this.pageSize())
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<CustomersPage>) => {
          this.customerState.set({
            ...this.customerState(),
            dataState: DataState.LOADED,
            appData: response,
          });
          this.customersPage.set(response?.data?.page?.content || []);
          this.totalRecords.set(response.data?.page?.totalElements || 0);
          // If no customers are found on the given page and there are customers to display,
          // we load the last valid page of data
          if (this.customersPage().length === 0 && this.totalRecords() > 0) {
            const lastPage = response.data?.page?.totalPages ? response.data.page.totalPages - 1 : 0;
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { name: this.customersFilters.name() || null, page: lastPage },
              queryParamsHandling: 'merge',
            });
          }
          // we compile first to get a consistent pagination
          this.first.set(this.currentPage() * this.pageSize());
        },
        error: (error: HttpErrorResponse) => {
          this.customerState.set({
            ...this.customerState(),
            dataState: DataState.ERROR,
            error: error.error.reason,
          });
        },
      });
  }

  //#endregion

  //#region events

  public onNameFilterChange(searchTerm: string) {
    this.searchCustomerByNameSubject.next(searchTerm);
  }

  public onTypeFilterChange(event: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { type: event.value, page: 0 },
      queryParamsHandling: 'merge',
    });
  }

  public onStatusFilterChange(event: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: event.value, page: 0 },
      queryParamsHandling: 'merge',
    });
  }

  //#endregion

  //#region pagination

  public onPageChange(event: any): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: event.page },
      queryParamsHandling: 'merge',
    });
  }
  //#endregion

  //#region dialog

  public onRegisterNewCustomerClick(): void {
    this.dialogService.open(EditCustomerDialogComponent, {
      header: `Register a new customer`,
      width: '35vw',
      modal: true,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }

  //#endregion
}
