import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, delay, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomersPage } from 'src/app/interfaces/appstate';
import { BreadcrumbItem } from 'src/app/interfaces/common.interface';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer } from 'src/app/interfaces/customer.interface';
import { State } from 'src/app/interfaces/state';
import { User } from 'src/app/interfaces/user';
import { CustomerService } from 'src/app/services/customer.service';
import { ResponsiveService } from 'src/app/services/responsive.service';

declare type direction = 'forward' | 'previous';

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
  public nameFilter = signal<string>('');
  public searchCustomerByNameSubject = new Subject<string>();

  //pagination
  public currentPage = signal<number>(0);
  public totalRecords = signal(0);
  public pageSize = signal(5);
  public first = signal(0);

  // breadcrumbs
  public items: BreadcrumbItem[] = [{ label: '', route: '/home', icon: 'pi pi-home' }, { label: 'Customers' }];

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public responsiveService: ResponsiveService,
  ) {}
  public ngOnInit(): void {
    // Read query params immediately on initialization
    this.nameFilter.set(this.route.snapshot.queryParamMap.get('name') || '');
    const page = this.route.snapshot.queryParamMap.get('page');
    this.currentPage.set(page ? parseInt(page, 10) : 0);
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
      const newNameFilter = params['name'] || '';
      const newPage = Number(params['page']) || 0;

      if (this.nameFilter() !== newNameFilter) {
        this.nameFilter.set(newNameFilter);
        this.currentPage.set(0);
        this.loadCustomersWithFilterSearch(newPage);
      } else if (this.currentPage() === newPage) {
        this.currentPage.set(newPage);
        this.loadCustomersWithFilterSearch(newPage);
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

  private async loadCustomersWithFilterSearch(page: number = 0): Promise<void> {
    this.customerState().dataState = DataState.LOADING;
    this.loading.set(true);
    try {
      const response = await lastValueFrom(
        this.customerService.searchCustomer(this.nameFilter(), page).pipe(
          delay(800), // Delay by 1000ms (1 second)
        ),
      );
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
        this.currentPage.set(lastPage);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { name: this.nameFilter() || null, page: lastPage },
          queryParamsHandling: 'merge',
        });
      }
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

  //#endregion

  //#region events

  public onSearchChange(searchTerm: string) {
    this.searchCustomerByNameSubject.next(searchTerm);
  }

  //#endregion

  //#region pagination

  public onPageChange(event: any): void {
    this.currentPage.set(event.page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage() },
      queryParamsHandling: 'merge',
    });
  }

  //#endregion
}
