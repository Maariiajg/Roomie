import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _toasts = signal<ToastMessage[]>([]);
  public readonly toasts = this._toasts.asReadonly();

  showError(message: string) {
    this.addToast(message, 'error');
  }

  showSuccess(message: string) {
    this.addToast(message, 'success');
  }

  showInfo(message: string) {
    this.addToast(message, 'info');
  }

  private addToast(message: string, type: ToastType) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type };
    
    this._toasts.update(current => [...current, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeToast(id);
    }, 5000);
  }

  removeToast(id: string) {
    this._toasts.update(current => current.filter(toast => toast.id !== id));
  }
}
