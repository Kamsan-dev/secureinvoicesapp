import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component'; // Adjust according to your actual root component
import { LoginComponent } from './components/login/login.component';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule, RouterOutlet, CommonModule, LoginComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
