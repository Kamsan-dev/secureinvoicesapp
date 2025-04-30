import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { authenticationGuard } from './guard/authentication.guard';

const routes: Routes = [
  {
    path: 'profile',
    loadChildren: () => import('./components/profile/profile.module').then((m) => m.ProfileModule),
    canMatch: [authenticationGuard],
  },
  {
    path: 'customers',
    loadChildren: () => import('./components/customers/customer.module').then((m) => m.CustomerModule),
    canActivate: [authenticationGuard],
  },
  {
    path: 'invoices',
    loadChildren: () => import('./components/invoices/invoice.module').then((m) => m.InvoiceModule),
    canActivate: [authenticationGuard],
  },
  {
    path: 'home',
    component: LandingPageComponent,
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: LandingPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
