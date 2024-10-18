import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileInfoComponent } from './settings/profile-info/profile-info.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SeProgressSpinnerModule } from 'src/app/common/progress-spinner/se-progress-spinner.module';
import { ProfileComponent } from './settings/profile-settings/profile.component';
import { SharedModule } from 'src/app/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [ProfileInfoComponent, ProfileComponent],
  imports: [CommonModule, ReactiveFormsModule, SeProgressSpinnerModule, SharedModule, RouterModule, FormsModule],
})
export class ProfileModule {}
