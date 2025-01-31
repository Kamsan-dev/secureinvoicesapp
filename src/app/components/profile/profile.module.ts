import { NgModule } from '@angular/core';
import { DgdCoreCheckboxModule } from 'src/app/common/checkbox/dgd-core-checkbox.module';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileAccountComponent } from './settings/profile-account/profile-account.component';
import { ProfileAuthenticationComponent } from './settings/profile-authentication/profile-authentication.component';
import { ProfileAuthorizationComponent } from './settings/profile-authorization/profile-authorization.component';
import { ProfileEventsHistoryComponent } from './settings/profile-events-history/profile-events-history.component';
import { ProfileInfoComponent } from './settings/profile-info/profile-info.component';
import { ProfilePasswordComponent } from './settings/profile-password/profile-password.component';
import { ProfileComponent } from './settings/profile.component';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
@NgModule({
  declarations: [
    ProfileInfoComponent,
    ProfileComponent,
    ProfilePasswordComponent,
    ProfileAuthorizationComponent,
    ProfileAccountComponent,
    ProfileAuthenticationComponent,
    ProfileEventsHistoryComponent,
  ],
  imports: [
    SeProgressSpinnerModule,
    SharedModule,
    DgdCoreCheckboxModule,
    ProfileRoutingModule,
    BreadcrumbModule,
    TabViewModule,
    InputTextModule,
    ButtonModule,
    InputTextareaModule,
    DropdownModule,
    ChipModule,
    TableModule,
  ],
})
export class ProfileModule {
  constructor() {
    console.log('profile module loaded');
  }
}
