import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomersPage } from '../interfaces/appstate';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { PersistanceService } from './persistance.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(
    private http: HttpClient,
    private persistanceService: PersistanceService,
    private router: Router,
  ) {}
  private readonly server: string = 'http://localhost:8080/';

  public getCustomers(page: number = 0, size: number = 10): Observable<CustomHttpResponse<CustomersPage>> {
    return this.http.get<CustomHttpResponse<CustomersPage>>(`${this.server}customer/list?page=${page}&size=${size}`);
  }
}
