import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { DataState } from 'src/app/enums/datastate.enum';
import { CustomHttpResponse } from 'src/app/interfaces/custom-http-response';
import { Customer } from 'src/app/interfaces/customer.interface';
import { Invoice, ViewInvoice } from 'src/app/interfaces/invoice.interface';
import { State } from 'src/app/interfaces/state';
import { InvoiceService } from 'src/app/services/invoice.service';
import { jsPDF as pdf } from 'jspdf';

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

  constructor(
    private invoiceService: InvoiceService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    // Get the id from the route
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy)).subscribe((params) => {
      const id = Number(params.get(this.INVOICE_ID));
      const invoiceNumber = params.get(this.INVOICE_NUMBER);
      this.invoiceId.set(id);
      this.invoiceNumber.set(invoiceNumber || '');
      this.loadInvoiceData();
    });
  }
  private async loadInvoiceData() {
    this.loading.set(true);
    this.invoiceState().dataState = DataState.LOADING;
    try {
      const response = await lastValueFrom(this.invoiceService.getInvoice(this.invoiceId()).pipe(delay(200)));
      this.invoiceState.set({
        ...this.invoiceState(),
        dataState: DataState.LOADED,
        appData: response,
      });
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

  //#region customer

  public getCustomer(): Customer | null {
    return this.invoiceState().appData?.data?.customer || null;
  }
  //#endregion

  //#region invoice

  public getInvoice(): Invoice | null {
    return this.invoiceState().appData?.data?.invoice || null;
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
