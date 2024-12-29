import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home/home.component';
import { authenticationGuard } from './guard/authentication.guard';

const routes: Routes = [
  {
    path: 'profile',
    loadChildren: () => import('./components/profile/profile.module').then((m) => m.ProfileModule),
    canActivate: [authenticationGuard],
  },
  {
    path: 'customer',
    loadChildren: () => import('./components/customers/customer.module').then((m) => m.CustomerModule),
    canActivate: [authenticationGuard],
  },
  {
    path: 'invoice',
    loadChildren: () => import('./components/invoices/invoice.module').then((m) => m.InvoiceModule),
    canActivate: [authenticationGuard],
  },
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: '**',
    component: HomeComponent,
    canActivate: [authenticationGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
