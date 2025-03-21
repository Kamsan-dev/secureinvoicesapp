import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, delay, distinctUntilChanged, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomersPage } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer } from 'src/app/interfaces/customer.interface';
import { State } from 'src/app/interfaces/state';
import { User } from 'src/app/interfaces/user';
import { CustomerService } from 'src/app/services/customer.service';

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

  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  //filter
  public nameFilter = signal<string>('');
  public currentPage = signal<number>(0);
  public searchCustomerByNameSubject = new Subject<string>();

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}
  public ngOnInit(): void {
    // Read query params immediately on initialization
    this.nameFilter.set(this.route.snapshot.queryParamMap.get('name') || '');
    const page = this.route.snapshot.queryParamMap.get('page');
    this.currentPage.set(page ? parseInt(page, 10) : 0);

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

  //#region UserInformations
  public getUserName(): string {
    return this.customerState().appData?.data?.user?.firstName + ' ' + this.customerState().appData?.data?.user?.lastName;
  }

  public getUserPictureProfile(): string {
    return this.customerState().appData?.data?.user?.imageUrl || 'https://img.freepik.com/free-icon/user_318-159711.jpg';
  }

  public getUserInformations(): User | null {
    return this.customerState().appData?.data?.user || null;
  }
  //#region Customers

  public selectCustomer(id: number): void {
    this.router.navigate(['/customer/view/' + id]);
  }

  public getCustomersPage(): Customer[] {
    return (this.customerState().appData?.data?.page.content as Customer[]) || [];
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
      const content = response?.data?.page?.content || [];
      const totalElements = response.data?.page?.totalElements || 0;
      // If no customers are found on the given page and there are customers to display,
      // we load the last valid page of data
      if (content.length === 0 && totalElements > 0) {
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

  public onPageChange(direction: direction): void {
    direction === 'forward' ? this.currentPage.set(this.currentPage() + 1) : this.currentPage.set(this.currentPage() - 1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { name: this.nameFilter() || null, page: this.currentPage() },
      queryParamsHandling: 'merge',
    });
  }

  public goToPage(page: number): void {
    this.currentPage.set(page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { name: this.nameFilter() || null, page: this.currentPage() },
      queryParamsHandling: 'merge',
    });
  }

  public getLastPageNumber(): number {
    const totalPages = this.customerState().appData?.data?.page?.totalPages || 0;
    return totalPages > 0 ? totalPages - 1 : 0;
  }

  //#endregion
}
