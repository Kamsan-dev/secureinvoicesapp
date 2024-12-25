import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileModule } from './components/profile/profile.module';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { SharedModule } from './shared.module';
import { StatsModule } from './components/stats/stats.module';
import { SeProgressSpinnerModule } from './common/progress-spinner/se-progress-spinner.module';
import { CustomerModule } from './components/customers/customer.module';
import { InvoiceModule } from './components/invoices/invoice.module';
import { CacheInterceptor } from './interceptor/cache.interceptor';
@NgModule({
  declarations: [AppComponent, HomeComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    RouterOutlet,
    CommonModule,
    LoginComponent,
    ProfileModule,
    SharedModule,
    StatsModule,
    SeProgressSpinnerModule,
    CustomerModule,
    InvoiceModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
