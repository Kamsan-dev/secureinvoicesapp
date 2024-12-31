import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToasterContainerComponent } from './toaster-container.component';
import { ToasterComponent } from './toaster.component';
import { ToasterService } from './toaster.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
  declarations: [ToasterContainerComponent, ToasterComponent],
  imports: [CommonModule, BrowserAnimationsModule],
  exports: [ToasterContainerComponent, ToasterComponent],
  providers: [ToasterService],
})
export class ToasterModule {}
