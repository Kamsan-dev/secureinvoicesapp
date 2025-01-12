import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MonthlyInvoiceStatistics } from '../components/stats/statistic';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { PersistanceService } from './persistance.service';

@Injectable()
export class StatisticService {
  constructor(
    private http: HttpClient,
    private persistanceService: PersistanceService,
    private router: Router,
  ) {}
  private readonly server: string = environment.API_BASE_URL;

  public getMonthlyInvoiceStatistics(): Observable<CustomHttpResponse<MonthlyInvoiceStatistics>> {
    return this.http.get<CustomHttpResponse<MonthlyInvoiceStatistics>>(`${this.server}statistic/mounthly-statistic-invoice`);
  }
}
