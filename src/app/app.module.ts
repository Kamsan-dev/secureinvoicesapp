import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './components/auth/auth.module';
import { HomeModule } from './components/home/home.module';
import { CoreModule } from './Core/core.module';
import { ToasterModule } from './common/toaster/toaster.module';
import { NavbarModule } from './components/navbar/navbar.module';
import { SidebarModule } from './components/sidebar/sidebar.module';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, CoreModule, HomeModule, AuthModule, AppRoutingModule, ToasterModule, NavbarModule, SidebarModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
