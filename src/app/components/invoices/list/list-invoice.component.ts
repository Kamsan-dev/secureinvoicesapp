import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ToasterService } from 'src/app/common/toaster/toaster.service';
import { DataState } from 'src/app/enums/datastate.enum';
import { InvoicesPage } from 'src/app/interfaces/appstate';
import { BreadcrumbItem } from 'src/app/interfaces/common.interface';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Invoice, ViewInvoice } from 'src/app/interfaces/invoice.interface';
import { State } from 'src/app/interfaces/state';
import { InvoiceService } from 'src/app/services/invoice.service';
import { ResponsiveService } from 'src/app/services/responsive.service';

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

  //pagination
  public currentPage = signal<number>(0);
  public totalRecords = signal(0);
  public pageSize = signal(5);
  public first = signal(0);

  //dialog
  public isNewInvoiceDialogVisible = signal(false);
  public newInvoiceDescription = '';

  public loading = signal(false);
  private destroy: Subject<void> = new Subject<void>();

  // breadcrumbs
  public items: BreadcrumbItem[] = [{ label: '', route: '/home', icon: 'pi pi-home' }, { label: 'Invoices' }];

  public readonly DataState = DataState;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    public responsiveService: ResponsiveService,
    private toasterService: ToasterService,
  ) {}
  public ngOnInit(): void {
    const page = this.route.snapshot.queryParamMap.get('page');
    this.currentPage.set(page ? parseInt(page, 10) : 0);
    this.first.set(this.currentPage() * this.pageSize());

    // Listen for query parameter changes
    this.route.queryParams.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const newPage = Number(params['page']) || 0;
      this.loadInvoices(newPage);
    });
  }

  private async loadInvoices(page: number = 0): Promise<void> {
    this.invoiceState().dataState = DataState.LOADING;
    this.loading.set(true);
    try {
      const response = await lastValueFrom(this.invoiceService.getInvoices(page, 5));
      this.invoiceState.set({
        ...this.invoiceState(),
        dataState: DataState.LOADED,
        appData: response,
      });
      const content = response?.data?.page?.content || [];
      const totalElements = response.data?.page?.totalElements || 0;
      this.totalRecords.set(response.data?.page.totalElements || 0);
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

  //#region events

  public onSaveNewInvoiceClick(event: MouseEvent | TouchEvent): void {
    event.stopImmediatePropagation();
    this.loading.set(true);
    this.invoiceState().dataState = DataState.LOADING;

    this.invoiceService
      .createInvoice(this.newInvoiceDescription)
      .pipe(
        takeUntil(this.destroy),
        finalize(() => {
          this.loading.set(false);
          this.isNewInvoiceDialogVisible.set(false);
        }),
      )
      .subscribe({
        next: (response: CustomHttpResponse<ViewInvoice>) => {
          this.invoiceState.set({
            ...this.invoiceState(),
            dataState: DataState.LOADED,
          });
          this.invoiceState().appData?.data?.page.content.unshift(response.data?.invoice as Invoice);
          this.toasterService.show('success', `Success !`, 'Invoice has been created successfully');
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

  public onRedirectToInvoice(invoiceId: number, invoiceNumber: string): void {
    this.router.navigate(['/invoices/view', invoiceId, invoiceNumber]);
  }

  //#endregion

  //#region invoices

  public invoicesPage = computed(() => {
    return (this.invoiceState().appData?.data?.page.content as Invoice[]) || [];
  });

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
