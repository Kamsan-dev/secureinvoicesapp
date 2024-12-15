import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, delay, distinctUntilChanged, lastValueFrom, pipe, Subject, take, takeUntil } from 'rxjs';
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
  public currentPage = signal<number>(0);
  private destroy: Subject<void> = new Subject<void>();

  //filter
  public nameFilter: string = '';
  public searchCustomerByNameSubject = new Subject<string>();

  constructor(
    private customerService: CustomerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}
  public ngOnInit(): void {
    // Read query params immediately on initialization
    this.nameFilter = this.route.snapshot.queryParamMap.get('name') || '';

    // Load customers based on the presence of the nameFilter
    if (this.nameFilter) {
      this.loadCustomersWithFilterSearch();
    } else {
      this.loadCustomers();
    }
    // Observable to handle the search debounce
    this.searchCustomerByNameSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy)).subscribe((filter: string) => {
      // Update the query params in the URL
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { name: filter || null },
        queryParamsHandling: 'merge',
      });
    });

    // Listen for query param changes to update filter and reload data
    this.route.queryParams.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const newNameFilter = params['name'] || '';
      // Avoid unnecessary reloads when the filter hasn't changed
      if (this.nameFilter !== newNameFilter) {
        this.nameFilter = newNameFilter;
        this.currentPage.set(0);
        this.loadCustomersWithFilterSearch();
      }
    });
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  //#region customers
  private async loadCustomers(page: number = 0): Promise<void> {
    this.customerState().dataState = DataState.LOADING;
    this.loading.set(true);
    try {
      const response = await lastValueFrom(
        this.customerService.getCustomers(page).pipe(
          delay(1000), // Delay by 1000ms (1 second)
        ),
      );
      console.log(response);
      this.customerState.set({
        ...this.customerState(),
        dataState: DataState.LOADED,
        appData: response,
      });
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

  public goToNextOrPreviousPage(direction: direction): void {
    direction === 'forward' ? this.currentPage.set(this.currentPage() + 1) : this.currentPage.set(this.currentPage() - 1);
    this.goToPage(this.currentPage());
  }

  public goToPage(page: number): void {
    this.currentPage.set(page);
    console.log('current page: ' + this.currentPage());
    if (this.nameFilter === '') {
      this.loadCustomers(page);
    } else this.loadCustomersWithFilterSearch(page);
  }

  public getLastPageNumber(): number {
    const totalPages = this.customerState().appData?.data?.page?.totalPages || 0;
    return totalPages > 0 ? totalPages - 1 : 0;
  }

  public selectCustomer(_t32: Customer) {
    throw new Error('Method not implemented.');
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

  public getCustomersPage(): Customer[] {
    return (this.customerState().appData?.data?.page.content as Customer[]) || [];
  }

  private async loadCustomersWithFilterSearch(page: number = 0): Promise<void> {
    this.customerState().dataState = DataState.LOADING;
    this.loading.set(true);
    try {
      const response = await lastValueFrom(
        this.customerService.searchCustomer(this.nameFilter, page).pipe(
          delay(1000), // Delay by 1000ms (1 second)
        ),
      );
      console.log(response);
      this.customerState.set({
        ...this.customerState(),
        dataState: DataState.LOADED,
        appData: response,
      });
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

  //#endregion

  //#region events

  public onSearchChange(searchTerm: string) {
    this.searchCustomerByNameSubject.next(searchTerm);
  }
  //#endregion
}
