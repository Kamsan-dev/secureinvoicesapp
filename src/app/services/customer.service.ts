import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomersPage } from '../interfaces/appstate';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { Customer, EditCustomer, EditCustomerRequest, ViewCustomer } from '../interfaces/customer.interface';
import { PersistanceService } from './persistance.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class CustomerService {
  constructor(
    private http: HttpClient,
    private persistanceService: PersistanceService,
    private router: Router,
  ) {}
  private readonly server: string = environment.API_BASE_URL;

  public getCustomers(page: number = 0, size: number = 5): Observable<CustomHttpResponse<CustomersPage>> {
    return this.http.get<CustomHttpResponse<CustomersPage>>(`${this.server}customer/list?page=${page}&size=${size}`);
  }

  public editCustomer(form: EditCustomerRequest): Observable<CustomHttpResponse<EditCustomer>> {
    return this.http.post<CustomHttpResponse<EditCustomer>>(`${this.server}customer/create`, form);
  }

  public searchCustomer(keyword: string, page: number = 0, size: number = 5): Observable<CustomHttpResponse<CustomersPage>> {
    return this.http.get<CustomHttpResponse<CustomersPage>>(`${this.server}customer/search?keyword=${keyword}&page=${page}&size=${size}`);
  }

  public getCustomer(id: number): Observable<CustomHttpResponse<ViewCustomer>> {
    return this.http.get<CustomHttpResponse<ViewCustomer>>(`${this.server}customer/get/${id}`);
  }

  public updateCustomer(customer: Customer): Observable<CustomHttpResponse<ViewCustomer>> {
    return this.http.put<CustomHttpResponse<ViewCustomer>>(`${this.server}customer/update`, customer);
  }

  public downloadReport(): Observable<HttpEvent<Blob>> {
    return this.http.get(`${this.server}customer/download/report`, { reportProgress: true, observe: 'events', responseType: 'blob' });
  }
}
