import { AnimationType, ToastType } from './toast.type';

export interface Toast {
  type: ToastType;
  title: string;
  body: string;
  delay: number;
  animationState: AnimationType;
}
