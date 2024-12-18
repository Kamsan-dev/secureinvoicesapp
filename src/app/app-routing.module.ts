import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/settings/profile.component';
import { authenticationGuard } from './guard/authentication.guard';
import { EditCustomerComponent } from './components/customers/edit/edit-customer.component';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'user/verify/account/:key',
    loadComponent: () => import('./components/verify/verify.component').then((m) => m.VerifyComponent),
  },
  {
    path: 'user/verify/password/:key',
    loadComponent: () => import('./components/verify/verify.component').then((m) => m.VerifyComponent),
  },
  {
    path: 'resetpassword',
    loadComponent: () => import('./components/resetpassword/resetpassword.component').then((m) => m.ResetpasswordComponent),
  },
  {
    path: 'profile',
    component: ProfileComponent,
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
    component: HomeComponent,
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
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
