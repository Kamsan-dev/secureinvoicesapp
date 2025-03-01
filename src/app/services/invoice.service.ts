import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { InvoicesPage } from '../interfaces/appstate';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { EditInvoiceRequest, Invoice, InvoiceResponse, ViewInvoice } from '../interfaces/invoice.interface';
import { PersistanceService } from './persistance.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class InvoiceService {
  constructor(
    private http: HttpClient,
    private persistanceService: PersistanceService,
    private router: Router,
  ) {}
  private readonly server: string = environment.API_BASE_URL;

  public getInvoices(page: number = 0, size: number = 5): Observable<CustomHttpResponse<InvoicesPage>> {
    return this.http.get<CustomHttpResponse<InvoicesPage>>(`${this.server}invoice/list?page=${page}&size=${size}`);
  }

  public editInvoice(customerId: number, form: EditInvoiceRequest): Observable<CustomHttpResponse<InvoiceResponse>> {
    return this.http.post<CustomHttpResponse<InvoiceResponse>>(`${this.server}invoice/add-to-customer/${customerId}`, form);
  }

  public getInvoice(invoiceId: number): Observable<CustomHttpResponse<ViewInvoice>> {
    return this.http.get<CustomHttpResponse<ViewInvoice>>(`${this.server}invoice/get/${invoiceId}`);
  }

  public getMonthlyStatusInvoices(request: { status: string; monthYear: string }, page: number = 0, size: number = 5): Observable<CustomHttpResponse<InvoicesPage>> {
    return this.http.post<CustomHttpResponse<InvoicesPage>>(`${this.server}invoice/list/monthly-status?page=${page}&size=${size}`, request);
  }

  public updateInvoice(invoiceId: number, invoice: Invoice): Observable<CustomHttpResponse<ViewInvoice>> {
    return this.http.put<CustomHttpResponse<ViewInvoice>>(`${this.server}invoice/update/${invoiceId}`, invoice);
  }

  public deleteInvoice(invoiceId: number): Observable<CustomHttpResponse<void>> {
    return this.http.delete<CustomHttpResponse<void>>(`${this.server}invoice/delete/${invoiceId}`);
  }
}
