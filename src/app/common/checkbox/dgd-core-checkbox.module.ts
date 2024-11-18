import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { DgdCoreCheckboxComponent } from './components/dgd-core-checkbox/dgd-core-checkbox.component';

@NgModule({
  declarations: [DgdCoreCheckboxComponent],
  imports: [CommonModule, FormsModule],
  exports: [DgdCoreCheckboxComponent],
})
export class DgdCoreCheckboxModule {}
