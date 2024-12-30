import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterContainerComponent } from './toaster-container.component';
import { ToasterComponent } from './toaster.component';
import { ToasterService } from './toaster.service';

@NgModule({
  declarations: [ToasterContainerComponent, ToasterComponent],
  imports: [CommonModule],
  exports: [ToasterContainerComponent, ToasterComponent],
  providers: [ToasterService],
})
export class ToasterModule {}
