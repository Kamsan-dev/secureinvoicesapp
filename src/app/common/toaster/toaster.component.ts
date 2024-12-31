import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { Toast } from './toast.interface';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toaster',
  template: `
    <div class="se-toast se-toast-{{ toast.type }}" [style.top.px]="i * 80" [@toastAnimation]="this.toast.animationState">
      <i
        class="se-toast-icon fa"
        [ngClass]="{
          'fa-check': toast.type === 'success',
          'fa-triangle-exclamation': toast.type === 'warning',
          'fa-circle-exclamation': toast.type === 'error'
        }"
      ></i>
      <div class="se-toast--content">
        <div class="se-toast-heading">{{ toast.title }}</div>
        <span>{{ toast.body }}</span>
      </div>
      <i class="fa-solid fa-xmark close" (click)="onClose()"></i>
    </div>
  `,
  styleUrls: ['./toaster.component.scss'],
  animations: [
    trigger('toastAnimation', [
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'translateY(0)',
        }),
      ),
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
        }),
      ),
      transition('visible => hidden', animate('300ms ease-out')),
    ]),
  ],
})
export class ToasterComponent {
  @Input() public toast!: Toast;
  @Input() public i!: number;

  @Output() remove = new EventEmitter<number>();

  public onClose(): void {
    this.toast.animationState = 'hidden';
    setTimeout(() => {
      this.remove.emit(this.i);
    }, 300);
  }
}
