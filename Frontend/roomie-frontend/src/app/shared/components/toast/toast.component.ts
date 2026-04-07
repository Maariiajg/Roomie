import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div 
          class="min-w-[300px] p-4 rounded-lg shadow-lg flex justify-between items-center transition-all duration-300 ease-in-out transform translate-x-0"
          [ngClass]="{
            'bg-alert text-textMain': toast.type === 'error',
            'bg-primary text-white': toast.type === 'success',
            'bg-secondary text-white': toast.type === 'info'
          }"
        >
          <span class="font-medium font-sans">{{ toast.message }}</span>
          <button 
            (click)="notificationService.removeToast(toast.id)"
            class="ml-4 text-currentColor opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  notificationService = inject(NotificationService);
}
