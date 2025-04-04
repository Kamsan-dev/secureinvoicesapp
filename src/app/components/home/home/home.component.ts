import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject, finalize, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomersPage } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer } from 'src/app/interfaces/customer.interface';
import { State } from 'src/app/interfaces/state';
import { User } from 'src/app/interfaces/user';
import { CustomerService } from 'src/app/services/customer.service';
import { StatisticService } from 'src/app/services/statistic.service';
import { MonthlyInvoiceStatistic, MonthlyInvoiceStatistics } from '../../stats/statistic';
import { BreadcrumbItem } from 'src/app/interfaces/common.interface';

declare type direction = 'forward' | 'previous';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  public customerState = signal<State<CustomHttpResponse<CustomersPage>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public statisticState = signal<State<CustomHttpResponse<MonthlyInvoiceStatistics>>>({
    dataState: DataState.LOADED,
    appData: undefined,
    error: undefined,
  });

  public loading = signal(false);
  public currentPage = signal<number>(0);
  private destroy: Subject<void> = new Subject<void>();

  //excel report
  private fileStatusSubject = new BehaviorSubject<{ status: string; type: string; value: number } | undefined>(undefined);
  private fileStatus = this.fileStatusSubject.asObservable();
  public downloadStatus = signal<number | undefined>(undefined);

  // breadcrumbs

  public items: BreadcrumbItem[] = [{ label: '', route: '/home', icon: 'pi pi-home' }, { label: 'Dashboard' }];

  constructor(
    private customerService: CustomerService,
    private statisticService: StatisticService,
    private fb: FormBuilder,
  ) {}
  public ngOnInit(): void {
    this.customerState().dataState = DataState.LOADING;
    this.loadCustomers();
    this.loadStatistics();

    this.fileStatus.pipe(takeUntil(this.destroy)).subscribe((file) => {
      if (file !== undefined) {
        this.downloadStatus.set(file.value);
      }
    });
  }

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

  public downloadReport(): void {
    this.customerService
      .downloadReport()
      .pipe(takeUntil(this.destroy))
      .subscribe({
        next: (response) => {
          this.reportProgress(response);
        },
        error: (err) => {
          console.error('Download failed:', err);
        },
      });
  }
  private reportProgress(httpEvent: HttpEvent<Blob | string[]>): void {
    switch (httpEvent.type) {
      case HttpEventType.DownloadProgress || HttpEventType.UploadProgress:
        if (httpEvent.total) {
          const progress = Math.round((httpEvent.loaded / httpEvent.total) * 100);
          this.fileStatusSubject.next({ status: 'progress', type: 'Downloading...', value: progress });
        }
        break;
      case HttpEventType.ResponseHeader:
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Blob) {
          const blob = httpEvent.body; // Already a Blob
          this.saveFile(blob, `${httpEvent.headers.get('File-Name')}`);
        } else if (Array.isArray(httpEvent.body)) {
          const blob = new Blob(httpEvent.body, { type: `${httpEvent.headers.get('Content-Type')!};charset=utf-8` });
          this.saveFile(blob, `${httpEvent.headers.get('File-Name')}`);
        } else {
          console.error('Unexpected response body type:', typeof httpEvent.body);
        }
        this.fileStatusSubject.next(undefined);
        break;
      default:
        break;
    }
  }

  private saveFile(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  }

  private async loadCustomers(page: number = 0): Promise<void> {
    //this.customerState().dataState = DataState.LOADING;
    this.loading.set(true);
    try {
      const response = await lastValueFrom(this.customerService.getCustomers(page));
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
    this.loadCustomers(page);
  }

  public getLastPageNumber(): number {
    const totalPages = this.customerState().appData?.data?.page?.totalPages || 0;
    return totalPages > 0 ? totalPages - 1 : 0;
  }

  public selectCustomer(_t32: Customer) {
    throw new Error('Method not implemented.');
  }

  //#endregion

  //#region Statistics

  public loadStatistics(): void {
    this.loading.set(true);
    this.statisticService
      .getMonthlyInvoiceStatistics()
      .pipe(
        takeUntil(this.destroy),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response: CustomHttpResponse<MonthlyInvoiceStatistics>) => {
          this.statisticState.set({
            ...this.statisticState(),
            dataState: DataState.LOADED,
            appData: response,
          });
        },
        error: (error: HttpErrorResponse) => {
          this.statisticState.set({
            ...this.statisticState(),
            dataState: DataState.ERROR,
            error: error.error.reason,
          });
        },
      });
  }

  //#endregion

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
