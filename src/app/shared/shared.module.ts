import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  exports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
})
export class SharedModule {}
