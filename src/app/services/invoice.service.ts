import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomersPage } from '../interfaces/appstate';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { Customer, EditCustomer, EditCustomerRequest, ViewCustomer } from '../interfaces/customer.interface';
import { PersistanceService } from './persistance.service';
import { EditInvoiceRequest, InvoiceResponse } from '../interfaces/invoice.interface';

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

  public editInvoice(customerId: number, form: EditInvoiceRequest): Observable<CustomHttpResponse<InvoiceResponse>> {
    return this.http.post<CustomHttpResponse<InvoiceResponse>>(`${this.server}invoice/add-to-customer/${customerId}`, form);
  }
}
