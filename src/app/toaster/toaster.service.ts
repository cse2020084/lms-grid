// src/app/services/toaster.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToasterService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  public toast$ = this.toastSubject.asObservable();

  showSuccess(message: string) {
    this.showToast(message, 'success');
  }

  showError(message: string) {
    this.showToast(message, 'error');
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toastSubject.next({ message, type });

    // Automatically clear the toast after 3 seconds
    setTimeout(() => {
      this.toastSubject.next(null);
    }, 3000);
  }
}