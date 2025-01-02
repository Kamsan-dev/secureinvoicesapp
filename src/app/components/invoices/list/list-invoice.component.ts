import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { InvoicesPage } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Invoice } from 'src/app/interfaces/invoice.interface';
import { State } from 'src/app/interfaces/state';
import { User } from 'src/app/interfaces/user';
import { InvoiceService } from 'src/app/services/invoice.service';

declare type direction = 'forward' | 'previous';

@Component({
  selector: 'app-list-invoice',
  templateUrl: './list-invoice.component.html',
  styleUrls: ['./list-invoice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListInvoiceComponent implements OnInit {
  public invoiceState = signal<State<CustomHttpResponse<InvoicesPage>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  //filter
  //public nameFilter = signal<string>('');
  public currentPage = signal<number>(0);
  //public searchCustomerByNameSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
  ) {}
  public ngOnInit(): void {
    const page = this.route.snapshot.queryParamMap.get('page');
    this.currentPage.set(page ? parseInt(page, 10) : 0);
    //this.loadInvoices(this.currentPage());

    // Listen for query parameter changes
    this.route.queryParams.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const newPage = Number(params['page']) || 0;
      if (this.currentPage() === newPage) {
        this.currentPage.set(newPage);
        this.loadInvoices(newPage);
      }
    });
  }

  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  private async loadInvoices(page: number = 0): Promise<void> {
    this.invoiceState().dataState = DataState.LOADING;
    this.loading.set(true);
    try {
      const response = await lastValueFrom(
        this.invoiceService.getInvoices(page, 5).pipe(
          delay(800), // Delay by 1000ms (1 second)
        ),
      );
      this.invoiceState.set({
        ...this.invoiceState(),
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
          queryParams: { page: lastPage },
          queryParamsHandling: 'merge',
        });
      }
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
    }
  }

  //#region UserInformations
  public getUserName(): string {
    return this.invoiceState().appData?.data?.user?.firstName + ' ' + this.invoiceState().appData?.data?.user?.lastName;
  }

  public getUserPictureProfile(): string {
    return this.invoiceState().appData?.data?.user?.imageUrl || 'https://img.freepik.com/free-icon/user_318-159711.jpg';
  }

  public getUserInformations(): User | null {
    return this.invoiceState().appData?.data?.user || null;
  }

  public getInvoicesPage(): Invoice[] {
    return (this.invoiceState().appData?.data?.page.content as Invoice[]) || [];
  }

  public printInvoice(arg0: number): void {
    throw new Error('Method not implemented.');
  }

  //#region pagination

  public onPageChange(direction: direction): void {
    direction === 'forward' ? this.currentPage.set(this.currentPage() + 1) : this.currentPage.set(this.currentPage() - 1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage() },
      queryParamsHandling: 'merge',
    });
  }

  public goToPage(page: number): void {
    this.currentPage.set(page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage() },
      queryParamsHandling: 'merge',
    });
  }

  public getLastPageNumber(): number {
    const totalPages = this.invoiceState().appData?.data?.page?.totalPages || 0;
    return totalPages > 0 ? totalPages - 1 : 0;
  }

  //#endregion
}
