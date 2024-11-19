import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-second-custom',
  template: `
    <div class="editor-container" (mousedown)="onMouseDown($event)" (click)="onEditorClick($event)">
      <input
        #input
        type="text"
        [(ngModel)]="value"
        (ngModelChange)="onValueChange()"
        [class.has-error]="isDuplicate || isEmpty"
        class="ag-input-field-input ag-text-field-input"
        (keydown)="onKeyDown($event)"
        (blur)="onBlur($event)"
      />
      <div 
        *ngIf="showWarning" 
        class="warning-message"
        [class.duplicate-warning]="isDuplicate"
        [class.empty-warning]="isEmpty"
      >
        {{ warningMessage }}
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      position: relative;
      height: 100%;
    }
    .has-error {
      border: 1px solid red !important;
    }
    .warning-message {
      position: absolute;
      bottom: -10px;
      left: 0;
      font-size: 12px;
      padding: 2px 4px;
      border-radius: 2px;
      z-index: 1000;
      white-space: nowrap;
    }
    .duplicate-warning {
      color: #d32f2f;
      
    }
    .empty-warning {
      color: #f57c00;
      
    }
  `]
})
export class SecondCustomComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild('input') input!: ElementRef;
  
  private params: ICellEditorParams;
  private originalValue: any;
  public value: any;
  public isDuplicate: boolean = false;
  public isEmpty: boolean = false;
  public showWarning: boolean = false;
  public warningMessage: string = '';
  
  private isEditing: boolean = false;
  private isFirstClick: boolean = true;
  
  agInit(params: ICellEditorParams): void {
    console.log('agInit called with params:', params);
    this.params = params;
    this.originalValue = params.value;
    this.value = params.value;
    
    // Initialize validation state
    // Delay value change processing to allow params to initialize
  window.setTimeout(() => {
    this.validateField();
  });
    
    // Set editing started flag
    window.setTimeout(() => {
      this.isEditing = true;
    }, 100);
  }

  ngAfterViewInit() {
    window.setTimeout(() => {
      this.input.nativeElement.focus();
      this.input.nativeElement.select();
    });
  }

  onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isFirstClick) {
      event.preventDefault();
    }
  }

  onEditorClick(event: MouseEvent): void {
    event.stopPropagation();
    this.isFirstClick = false;
  }

  onValueChange(): void {

    if (!this.params) {
      console.warn('onValueChange called before params were initialized');
      return;
    }

    this.checkDuplicates();
    this.validateField();
    this.updateWarningMessage();
    this.updateGridData();
  }

  checkDuplicates(): void {
    if (!this.value || this.value.trim() === '') {
      this.isDuplicate = false;
      return;
    }

    const columnId = this.params.column.getColId();
    const rowIndex = this.params.rowIndex;
    const allNodes: any[] = [];
    
    this.params.api.forEachNode(node => allNodes.push(node));
    
    this.isDuplicate = allNodes.some((node, index) => {
      const cellValue = node.data[columnId];
      return index !== rowIndex && 
             cellValue && 
             cellValue.toString().toLowerCase().trim() === this.value.toString().toLowerCase().trim();
    });
  }

  getValue(): any {
    return this.isEmpty ? this.originalValue : this.value.trim();
  }

  isCancelBeforeStart(): boolean {
    return false;
  }

  isCancelAfterEnd(): boolean {
    return this.isDuplicate || this.isEmpty;
  }

  onBlur(event: FocusEvent): void {
    this.validateField();
    this.updateWarningMessage();
    this.updateGridData();
    
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget || !this.isTargetInGrid(relatedTarget)) {
      if (!this.isEmpty && !this.isDuplicate) {
        this.params.api.stopEditing();
      }
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.validateField();
      this.updateWarningMessage();
      
      if (!this.isEmpty && !this.isDuplicate) {
        this.params.api.stopEditing();
      }
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.value = this.originalValue;
      this.validateField();
      this.updateWarningMessage();
      this.params.api.stopEditing();
      event.preventDefault();
    }


    if (
      !event.key.match(/[a-zA-Z\s]/) && // Allow only letters and spaces
      event.key !== 'Backspace' && // Allow Backspace
      event.key !== 'Tab' // Allow Tab
    ) {
      event.preventDefault(); // Block invalid keypresses
    }
  }

  private isTargetInGrid(element: HTMLElement): boolean {
    return !!element?.closest('.ag-root-wrapper');
  }

  private validateField(): void {
    this.isEmpty = !this.value || this.value.trim() === '';
    this.showWarning = this.isEmpty || this.isDuplicate;
  }

  private updateWarningMessage(): void {
    if (this.isEmpty) {
      this.warningMessage = 'This field cannot be empty';
    } else if (this.isDuplicate) {
      this.warningMessage = 'Duplicate value detected';
    } else {
      this.warningMessage = '';
    }
  }

  private updateGridData(): void {
    try {
      // Basic params validation
      if (!this.params?.node || !this.params?.column) {
        console.warn('Required grid parameters are not available');
        return;
      }

      // Get the current column ID
      const currentColId = this.params.column.getColId();
      if (!currentColId) {
        console.warn('Column ID is not available');
        return;
      }

      // Get the warning field name
      const warningField = `${currentColId}Warning`;

      // Instead of using setDataValue, update the data directly
      const updatedData = {
        ...this.params.node.data,
        [warningField]: this.warningMessage
      };
      
      // Update the entire row data
      this.params.node.setData(updatedData);

      // Refresh the specific cells
      if (this.params.api) {
        this.params.api.refreshCells({
          rowNodes: [this.params.node],
          columns: [warningField],
          force: true
        });
      }

    } catch (error) {
      console.error('Error in updateGridData:', {
        error,
        columnExists: !!this.params?.column,
        nodeExists: !!this.params?.node,
        currentValue: this.value,
        warningMessage: this.warningMessage
      });
    }
  }
}