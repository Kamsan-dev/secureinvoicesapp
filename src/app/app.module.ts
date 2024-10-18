import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CustomersComponent } from './components/customers/customers.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileModule } from './components/profile/profile.module';
import { StatsComponent } from './components/stats/stats.component';
import { TokenInterceptor } from './interceptor/token.interceptor';
import { SharedModule } from './shared.module';
@NgModule({
  declarations: [AppComponent, CustomersComponent, HomeComponent, StatsComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule, AppRoutingModule, RouterOutlet, CommonModule, LoginComponent, ProfileModule, SharedModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
