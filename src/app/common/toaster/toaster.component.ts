import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Toast } from './toast.interface';

@Component({
  selector: 'app-toaster',
  template: `
    <div class="toast toast-{{ toast.type }}" [style.top.px]="i * 100">
      <h4 class="toast-heading">{{ toast.title }}</h4>
      <p>{{ toast.body }}</p>
      <a class="close" (click)="remove.emit(i)">&times;</a>
    </div>
  `,
  styleUrls: ['./toaster.component.scss'],
})
export class ToasterComponent {
  @Input() public toast!: Toast;
  @Input() public i!: number;

  @Output() remove = new EventEmitter<number>();
}
