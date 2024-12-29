import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CacheInterceptor } from '../interceptor/cache.interceptor';
import { TokenInterceptor } from '../interceptor/token.interceptor';
import { CustomerService } from '../services/customer.service';
import { HttpCacheService } from '../services/http.cache.service';
import { PersistanceService } from '../services/persistance.service';
import { UserService } from '../services/user.service';
import { InvoiceService } from '../services/invoice.service';

@NgModule({
  declarations: [],
  providers: [
    CustomerService,
    HttpCacheService,
    PersistanceService,
    UserService,
    InvoiceService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
  ],
  imports: [HttpClientModule],
})
export class CoreModule {}
