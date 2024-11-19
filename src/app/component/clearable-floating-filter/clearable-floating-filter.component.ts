import { Component } from '@angular/core';
import {
  IFloatingFilter,
  IFloatingFilterParams,
  TextFilterModel,
} from 'ag-grid-community';

@Component({
  selector: 'app-clearable-floating-filter',
  template: `
    <div class="floating-filter">
      <input
        type="text"
        [(ngModel)]="currentValue"
        (input)="onInput($event)"
        placeholder="Search..."
      />
      <button *ngIf="currentValue" (click)="clearFilter()">✖</button>
    </div>
  `,
  styles: [
    `
      .floating-filter {
        display: flex;
        align-items: center;
        gap: 3px;
      }
      input {
        flex: 1;
        padding: 4px;
        width:100px;
      }
      button {
        border: none;
        background: none;
        cursor: pointer;
        color:red;
        font-size: 12px;
      }
    `,
  ],
})
export class ClearableFloatingFilterComponent{
  private params: IFloatingFilterParams;
  currentValue: string = '';

  agInit(params: IFloatingFilterParams): void {
    this.params = params;
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentValue = value;
    this.params.parentFilterInstance((instance) =>
      instance.onFloatingFilterChanged('contains', value)
    );
  }

  clearFilter(): void {
    this.currentValue = '';
    this.params.parentFilterInstance((instance) =>
      instance.onFloatingFilterChanged(null, null)
    );
  }
}
