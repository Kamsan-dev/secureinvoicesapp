import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Profile } from '../interfaces/appstate';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { LoginRequestInterface, updateProfilePasswordRequestInterface, updateProfilRequestInterface } from '../interfaces/login-request';
import { PersistanceService } from './persistance.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

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

  public getCustomers(page: number = 0, size: number = 10): Observable<CustomHttpResponse<any>> {
    return this.http.get<CustomHttpResponse<any>>(`${this.server}customer/list?page=${page}&size=${size}`);
  }
}
