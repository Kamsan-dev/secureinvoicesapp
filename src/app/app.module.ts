import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CustomersComponent } from './components/customers/customers.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { StatsComponent } from './components/stats/stats.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [AppComponent, ProfileComponent, CustomersComponent, HomeComponent, NavbarComponent, StatsComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule, AppRoutingModule, RouterOutlet, CommonModule, LoginComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
