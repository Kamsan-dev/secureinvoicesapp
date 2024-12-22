import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { InvoicesPage } from '../interfaces/appstate';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { EditInvoiceRequest, InvoiceResponse } from '../interfaces/invoice.interface';
import { PersistanceService } from './persistance.service';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(
    private http: HttpClient,
    private persistanceService: PersistanceService,
    private router: Router,
  ) {}
  private readonly server: string = 'http://localhost:8080/';

  public getInvoices(page: number = 0, size: number = 5): Observable<CustomHttpResponse<InvoicesPage>> {
    return this.http.get<CustomHttpResponse<InvoicesPage>>(`${this.server}invoice/list?page=${page}&size=${size}`);
  }

  public editInvoice(customerId: number, form: EditInvoiceRequest): Observable<CustomHttpResponse<InvoiceResponse>> {
    return this.http.post<CustomHttpResponse<InvoiceResponse>>(`${this.server}invoice/add-to-customer/${customerId}`, form);
  }
}
