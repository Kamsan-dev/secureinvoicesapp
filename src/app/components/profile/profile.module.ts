import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileInfoComponent } from './settings/profile-info/profile-info.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';
import { ProfileComponent } from './settings/profile.component';
import { SharedModule } from 'src/app/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfilePasswordComponent } from './settings/profile-password/profile-password.component';
import { ProfileAuthorizationComponent } from './settings/profile-authorization/profile-authorization.component';
import { ProfileAccountComponent } from './settings/profile-account/profile-account.component';
import { DgdCoreCheckboxModule } from 'src/app/common/checkbox/dgd-core-checkbox.module';
import { ProfileAuthenticationComponent } from './settings/profile-authentication/profile-authentication.component';
import { ProfileEventsHistoryComponent } from './settings/profile-events-history/profile-events-history.component';
@NgModule({
  declarations: [ProfileInfoComponent, ProfileComponent, ProfilePasswordComponent, ProfileAuthorizationComponent, ProfileAccountComponent, ProfileAuthenticationComponent, ProfileEventsHistoryComponent],
  imports: [CommonModule, ReactiveFormsModule, SeProgressSpinnerModule, SharedModule, RouterModule, FormsModule, DgdCoreCheckboxModule],
})
export class ProfileModule {}
