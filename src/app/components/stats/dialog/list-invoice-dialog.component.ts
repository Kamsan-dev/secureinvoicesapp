import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataState } from 'src/app/enums/datastate.enum';
import { InvoicesPage } from 'src/app/interfaces/appstate';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Invoice } from 'src/app/interfaces/invoice.interface';
import { State } from 'src/app/interfaces/state';
import { InvoiceService } from 'src/app/services/invoice.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-list-invoice-dialog',
  standalone: true,
  imports: [CommonModule, TableModule, RouterModule, ButtonModule, ChipModule, PaginatorModule],
  templateUrl: './list-invoice-dialog.component.html',
  styleUrl: './list-invoice-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListInvoiceDialogComponent implements OnInit {
  public invoiceState = signal<State<CustomHttpResponse<InvoicesPage>>>({
    dataState: DataState.LOADING,
    appData: undefined,
    error: undefined,
  });
  private config = inject(DynamicDialogConfig);
  private destroyRef = inject(DestroyRef);
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);
  private ref = inject(DynamicDialogRef);
  public invoices = computed(() => {
    return (this.invoiceState().appData?.data?.page?.content as Invoice[]) || [];
  });
  public totalRecords = signal(0);

  public sizePage = signal(2);
  public currentPage = signal<number>(0);
  private invoiceDataRequest = { status: this.config.data.status, monthYear: this.config.data.date };

  public readonly DataState = DataState;

  public ngOnInit(): void {
    this.loadInvoices();
  }

  public onCloseDialog(invoiceId: number, invoiceNumber: string): void {
    this.router.navigate(['/invoice/view', invoiceId, invoiceNumber]).then(() => {
      this.ref!.close();
    });
  }

  public loadInvoices(): void {
    this.invoiceService
      .getMonthlyStatusInvoices(this.invoiceDataRequest, this.currentPage(), this.sizePage())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: CustomHttpResponse<InvoicesPage>) => {
          this.invoiceState.set({
            ...this.invoiceState(),
            dataState: DataState.LOADED,
            appData: response,
          });
          this.totalRecords.set(response.data?.page.totalElements || 0);
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

  public onPageChange(event: any): void {
    this.currentPage.set(event.page);
    this.loadInvoices();
  }
}
