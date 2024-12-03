import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { ToasterService } from 'src/app/toaster/toaster.service';

@Component({
  selector: 'app-second-custom',
  template: `
    <div class="editor-container" (mousedown)="onMouseDown($event)" (click)="onEditorClick($event)">
      <div class="input-button-container">
        <input
          #input
          type="text"
          [(ngModel)]="value"
          (ngModelChange)="onValueChange($event)"
          [ngClass]="{'has-error': isDuplicate || isEmpty}"
          class="ag-input-field-input ag-text-field-input"
          (keydown)="onKeyDown($event)"
          (blur)="onBlur($event)"
          (cellEditingStopped)="onCellEditingStopped($event)"
        />
        <div class="button-container" *ngIf="!isTemporaryRow">
          <button 
            class="editor-button save-button" 
            [ngClass]="{'disabled': isDuplicate || isEmpty}"
            (click)="onSaveClick($event)"
            [disabled]="disableButton()"
            type="button"
          >✓</button>
          <button 
            class="editor-button cancel-button" 
            (click)="onCancelClick($event)"
            type="button"
          >✗</button>
        </div>
      </div>
      <div 
        *ngIf="showWarning" 
        class="warning-message"
        [ngClass]="{
          'duplicate-warning': isDuplicate,
          'empty-warning': isEmpty,
          'max-length':maxLength
        }"
      >
        {{ warningMessage }}
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      position: relative;
      height: 100%;
      padding: 2px;
    }
    .input-button-container {
      display: flex;
      align-items: center;
      gap: 1vw;
    }
    .button-container {
      display: flex; 
      gap: 1vw;
    }
    .editor-button {
      padding: 1px 4px;
      cursor: pointer;
      border: 1px solid #ccc;
      background: white;
      border-radius: 2px;
      font-size: 12px;
      min-width: 20px;
      height: 5vh;
      width: 2vw;
      line-height: 1;
    }
    .save-button {
      color: green;
    }
    .save-button.disabled {
      color: #ccc;
      cursor: not-allowed;
    }
    .cancel-button {
      color: red;
    }
    .has-error {
      border: 1px solid red !important;
    }
    .warning-message {
      position: absolute;
      bottom: -9px;
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
    .max-length {
      color: #d32f2f;
    }
    .empty-warning {
      color: #f57c00;
    }
    input {
      flex: 1;
      min-width: 0;
    }
  `]
})
export class SecondCustomComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild('input') input!: ElementRef;

  constructor(private toaster:ToasterService){}
  
  public params: ICellEditorParams;
  private originalValue: any;
  public value: any;
  public isDuplicate: boolean = false;
  public isEmpty: boolean = false;
  public showWarning: boolean = false;
  public warningMessage: string = '';
  
  
  private isFirstClick: boolean = true;
  private saveClicked: boolean = false;
  private isEditing:boolean=false;
  public isTemporaryRow: boolean = false;
  public maxLength:boolean=false;

  
  
  agInit(params: ICellEditorParams): void {
    this.params = params;
    this.originalValue = params.value;
    this.value = params.value;
    this.saveClicked = false;

    
    // Check if this is a temporary row
    this.isTemporaryRow = params.node.data.isNew === true;


    console.log(this.isTemporaryRow, params) 
    setTimeout(() => {
      this.validateField();
    });
    
    setTimeout(() => {
      this.isEditing = true;
    }, 100);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.input && this.input.nativeElement) {
        this.input.nativeElement.focus();
        this.input.nativeElement.select();
      }
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

  onValueChange(newValue: any): void {

    this.value = newValue;
    if (!this.params) {
      return;
    }
    
   
    this.checkDuplicates();
    this.checkLength(newValue);
    this.validateField();
    this.updateWarningMessage();
    this.validateWarnings(); // added

    if(this.maxLength){
      this.validateWarnings();
      this.value='';
      this.toaster.showError('Max Length Reached')
    }
  }
  checkLength(newValue) {
    if(this.params.colDef.field === 'entityBusinessShortCode'){
      if(newValue.length>=5){
        this.maxLength=true;
      }else{
        this.maxLength=false;
      }
    }else{
      if(newValue.length>=17){
        this.maxLength=true;
      }else{
        this.maxLength=false;
      }
    }
  }

  onSaveClick(event: MouseEvent): void {
    event.stopPropagation();

    // If maxLength is true for a temporary row, set the value to empty
  if (this.maxLength) {
    // this.value = '';
    // this.isEmpty = true;
    // this.validateField();
    // this.updateWarningMessage();
    
    // // Update the grid cell to empty
    // const field = this.params.column.getColId();
    // const rowData = this.params.node.data;
    // rowData[field] = '';
    // this.params.node.setDataValue(field, '');
    
    // this.params.api.stopEditing();
    return;
  }

    if (!this.isEmpty && !this.isDuplicate) {
      this.saveClicked = true;
      this.maxLength=false;
      this.validateField();
      this.updateWarningMessage();

      // Get the row data and update it immediately
      const rowData = this.params.node.data;
      const field = this.params.column.getColId();
      rowData[field] = this.value.trim();

      // Update the grid cell immediately
      this.params.node.setDataValue(field, this.value.trim());

      // Get reference to parent component
      const parent = this.params.context.componentParent;
      
      // Call parent's editRow method with updated data
      if (parent && parent.editRow) {
        parent.editRow(rowData);
      }
      
    

      this.params.api.stopEditing();
    }
  }

  onCancelClick(event: MouseEvent): void {
    event.stopPropagation();
    this.value = this.originalValue;
    this.validateField();
    this.updateWarningMessage();
    this.maxLength=false;
    this.params.api.stopEditing();
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
    //return this.isTemporaryRow ? this.value.trim() : this.originalValue;  --1
    //return this.value ? this.value.trim() : this.originalValue;           --2

    // For temporary rows, return trimmed value
    // For existing rows, return original or current value based on save status
    return this.isTemporaryRow 
      ? this.value.trim() 
      : (this.saveClicked ? this.value.trim() : this.originalValue);    //   --3
  }

  isCancelBeforeStart(): boolean {
    return false;
  }

  isCancelAfterEnd(): boolean {
    return this.isDuplicate || this.isEmpty;
  }

  // onBlur(event: FocusEvent): void {

  //   // For temporary rows, retain the current value
  //   if (this.isTemporaryRow) {
  //     if (!this.isDuplicate && !this.isEmpty) {
  //       const field = this.params.column.getColId();
  //       const rowData = this.params.node.data;
  //       rowData[field] = this.value.trim();
  //       this.params.node.setDataValue(field, this.value.trim());
  //     }
  //     return;
  //   }

  //   const relatedTarget = event.relatedTarget as HTMLElement;
    
   
    
  //   // For existing rows, keep the existing blur logic
  //   if (relatedTarget?.classList.contains('save-button')) {
  //     return;
  //   }
    
  //   if (relatedTarget?.classList.contains('cancel-button')) {
  //     return;
  //   }
    
  //   this.value = this.originalValue;
  //   this.validateField();
  //   this.updateWarningMessage();

  //   if (this.params?.node && this.params?.column) {
  //     const field = this.params.column.getColId();
  //     const rowData = this.params.node.data;
  //     rowData[field] = this.originalValue;

  //     this.params.node.setDataValue(field, this.originalValue);
  //   }

  //   this.params.api.stopEditing();
  // }


  /*----------*/

  onBlur(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    // If it's a temporary/new row, keep the warnings visible
    if (this.isTemporaryRow) {
      // Validate the field to ensure warnings are set correctly
      this.validateField();
      this.updateWarningMessage();
      
      // If there are no save/cancel buttons clicked, do not revert the value
      if (relatedTarget?.classList.contains('save-button') || 
          relatedTarget?.classList.contains('cancel-button')) {
        return;
      }
      
      // If there are validation errors, prevent stopping editing
      if (this.isDuplicate || this.isEmpty || this.maxLength) {
        event.preventDefault();
        return;
      }
      
      // For temporary rows, update the value if valid
      if (!this.isDuplicate && !this.isEmpty) {
        const field = this.params.column.getColId();
        const rowData = this.params.node.data;
        rowData[field] = this.value.trim();
        this.params.node.setDataValue(field, this.value.trim());
      }
      
      return;
    }
    
    // Existing row logic remains the same
    if (relatedTarget?.classList.contains('save-button')) {
      return;
    }
    
    if (relatedTarget?.classList.contains('cancel-button')) {
      return;
    }
    
    this.value = this.originalValue;
    this.validateField();
    this.updateWarningMessage();

    if (this.params?.node && this.params?.column) {
      const field = this.params.column.getColId();
      const rowData = this.params.node.data;
      rowData[field] = this.originalValue;

      this.params.node.setDataValue(field, this.originalValue);
    }

    this.params.api.stopEditing();
  }

 

  // Add method to ensure warnings are validated and shown
  private validateWarnings(): void {
    if (this.isTemporaryRow) {
      this.validateField();
      this.updateWarningMessage();
      this.showWarning = this.isEmpty || this.isDuplicate || this.maxLength;
    }
  }


  keepWarningsVisible(): void {
    if (this.isTemporaryRow) {
      this.validateWarnings();
    }
  }



   /*----------*/
  
  

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSaveClick(new MouseEvent('click'));
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.onCancelClick(new MouseEvent('click'));
      event.preventDefault();
    }

    if (
      !event.key.match(/[a-zA-Z\s]/) && 
      event.key !== 'Backspace' && 
      event.key !== 'Tab'
    ) {
      event.preventDefault();
    }
  }

  private validateField(): void {
    this.isEmpty = !this.value || this.value.trim() === '';
    this.showWarning = this.isEmpty || this.isDuplicate || this.maxLength;
  }

  private updateWarningMessage(): void {
    if (this.isEmpty) {
      this.warningMessage = 'This field cannot be empty';
    } else if (this.isDuplicate) {
      this.warningMessage = 'Duplicate value detected';
    } else if(this.maxLength){
      this.warningMessage = 'Max Length Reached';
    }
    else {
      this.warningMessage = '';
    }

    // Update parent component with column-specific warning
    if (this.params?.context?.componentParent?.updateColumnWarning) {
      const columnField = this.params.column.getColId();
      this.params.context.componentParent.updateColumnWarning(
        columnField, 
        this.warningMessage
      );
    }
  }

  onCellEditingStopped(event: any) {
    const isCreatingNewRow = this.params.context.componentParent.isCreatingNewRow;
    if (isCreatingNewRow) {
      //this.onCancelClick(event); // Revert only if not creating a new row
      return
    }
    // if (event.key !== 'Enter') {
    //   this.onCancelClick(event);
    // }

    
    /*
    for disabling button
    */

    
  
  }

  disableButton():boolean{
    return this.isDuplicate || this.isEmpty || this.maxLength || this.params.context.componentParent.isCreatingNewRow
  }
}


