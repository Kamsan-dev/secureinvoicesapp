import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SeProgressSpinnerModule } from './common/progress-spinner/se-progress-spinner.module';
import { AuthModule } from './components/auth/auth.module';
import { CustomerModule } from './components/customers/customer.module';
import { HomeModule } from './components/home/home.module';
import { InvoiceModule } from './components/invoices/invoice.module';
import { ProfileModule } from './components/profile/profile.module';
import { CoreModule } from './Core/core.module';
import { ToasterModule } from './common/toaster/toaster.module';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CoreModule, HomeModule, ProfileModule, SeProgressSpinnerModule, CustomerModule, InvoiceModule, AuthModule, AppRoutingModule, ToasterModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
