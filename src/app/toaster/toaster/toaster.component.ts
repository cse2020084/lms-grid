// src/app/component/toaster.component.ts
import { Component } from '@angular/core';
import { ToasterService } from '../toaster.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-toaster',
  template: `
    <div 
      *ngIf="toast$ | async as toast" 
      [@toastState]="'visible'"
      [ngClass]="{
        'toast': true, 
        'toast-success': toast.type === 'success', 
        'toast-error': toast.type === 'error'
      }">
      {{ toast.message }}
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      top: 40px;
      right: 20px;
      padding: 15px;
      color: white;
      border-radius: 4px;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .toast-success {
      background-color: #28a745;
    }
    .toast-error {
      background-color: #dc3545;
    }
  `],
  animations: [
    trigger('toastState', [
      state('void', style({
        transform: 'translateX(100%)',
        opacity: 0
      })),
      state('visible', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      transition('void => visible', [
        animate('300ms ease-out')
      ]),
      transition('visible => void', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class ToasterComponent {
  toast$ = this.toasterService.toast$;

  constructor(private toasterService: ToasterService) {}
}