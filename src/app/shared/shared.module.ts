import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToasterModule } from '../common/toaster/toaster.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, ToasterModule],
  exports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, ToasterModule],
})
export class SharedModule {}
