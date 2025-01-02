import { Component, ElementRef, OnInit, ViewChild,ChangeDetectorRef, HostListener } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import {  GridOptions, ICellEditorParams, RowNode } from 'ag-grid-community';
import { ToasterService } from 'src/app/toaster/toaster.service';

// Add this interface at the top of your file
interface CustomRowNode extends RowNode {
  isEditing?: boolean;
  originalData?: any;
  error?:any;
  fieldErrors?: { [key: string]: ValidationError };  // Track errors by field name
  hasError?:boolean;
}


interface ValidationError {
  type: 'duplicate' | 'empty' | 'maxLength' | 'pattern';
  message: string;
}

// Extend the ICellEditorParams interface to include your custom metadata
interface CustomCellEditorParams extends ICellEditorParams {
  metadata?: {
    parentField?: string[];
    // Add any other metadata properties you might need
  };
}

@Component({
  selector: 'app-custom-text-cell-editor',
  template: `
    <div [ngStyle]="getStyles()">
      <!-- Edit Mode -->
      <div class="editor-container" *ngIf="isEditing">
      <input *ngIf="isEditing"
        #input
        [(ngModel)]="value"
        (ngModelChange)="onValueChange()"
        (keydown)="onKeyDown($event)"
        (keydown.enter)="onEnterPressed()"
        (keydown.escape)="onEscapePressed()"
        type="text"
        class="custom-editor-input"
        [placeholder]="'Add ' + params.column.colDef.headerName"
        [ngClass]="{'error': hasErrors}"
      />
      </div>
        <!-- Display Mode -->
      <div *ngIf="!isEditing" 
           class="display-value"
           [ngClass]="{'error-text': hasErrors}">
        {{ value }}
      </div>
      <!-- Error Message (shown in both modes) -->
      <div *ngIf="currentError" 
           class="error-message" 
           [ngClass]="'error-' + currentError.type">
        {{ currentError.message }}
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      position: relative;
      height: 100%;
    }
    .custom-editor-input {
      width: calc(100% - 16px);
      height: 60%;
      padding: 10px;
      box-sizing: border-box;
    }
    .custom-editor-input.error {
      border-color: #ff4444;
      background-color: #fff0f0;
    }
    .display-value {
      display: flex;
      align-items: center;
    }
    .error-message {
      position: absolute;
      bottom: -20px;
      left: 0;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      z-index: 1000;
      white-space: nowrap;
    }
    .error-duplicate {
      background-color: #ff4444;
      color: white;
    }
    .error-empty {
      background-color: #ffa500;
      color: white;
    }
    .error-maxLength {
      background-color: #9932cc;
      color: white;
    }
      .error-pattern {
      background-color: #9932cc;
      color: white;
    }
  `]
})
export class CustomTextCellEditor implements ICellEditorAngularComp {
  @ViewChild('input') input: ElementRef;
  
  public params: any;
  public value: any;
  public isEditing: boolean = false;
  public currentError: ValidationError | null = null;
  
  // Validation configs (can be passed through params)
  private maxLength: number = 10; // Default value
  private isRequired: boolean = true; // Default value

  private validationRules: any;
  public isTemporaryRow: boolean = false;



  get hasErrors(): boolean {
    return !!this.currentError;
  }


  agInit(params: any): void {
    this.params = params;
    this.value = params.value;
    this.isEditing = (params.node as CustomRowNode).isEditing === true;

    // Retrieve persisted error from the row node
    this.currentError = (params.node as CustomRowNode).error || null;

    // Get validation configs from params if provided
    this.maxLength = params.maxLength || this.maxLength;
    this.isRequired = params.required !== undefined ? params.required : this.isRequired;
    this.validationRules = params.validationRules || {};

     // Check if this is a temporary row
     this.isTemporaryRow = params.node.data.isNew === true;

    if(this.isTemporaryRow){
      // Get the current column field
   const currentColumnField = params.column.getColId();
 
   // Check if the current column is NOT in the parent fields list
   const parentFields = params.metadata?.parentField || [];
   const isNotParentField = !parentFields.includes(currentColumnField);
 
   if (isNotParentField) {
     // Check if any of the parent fields are empty
     const hasEmptyParentFields = parentFields.some(field => {
       const value = params.data[field];
       return value === null || value === undefined || value === '';
     });
 
     if (hasEmptyParentFields) {
       // Handle the case when parent fields are empty
       // For example, show an error, prevent editing, etc.
       this.toaster.showError('First fill all the Dependent cells')
       params.stopEditing(true);
       console.warn('Parent fields cannot be empty');
       
       // Optional: You can add more specific handling
       // For instance, preventing the cell from being edited
       // params.stopEditing(true);
     }
   }
   }

    
  }

  constructor(private cdr: ChangeDetectorRef,
    private toaster: ToasterService
  ) {}

  // Optional: Add styles based on editing state
  getStyles() {
    return {
      'background-color': this.isEditing ? '#f5f5f5' : 'transparent',
      'height': '100%'
    };
  }

  getValue(): any {
    return this.value;
  }

  // Implement refresh to handle row updates
  refresh(params: any): boolean {
    this.params = params;
    this.value = params.value;

    // Retain error state if it exists
    if (this.currentError) {
      this.validateValue(); // Re-validate to ensure error is still applicable
  }

    this.isEditing = (params.node as CustomRowNode).isEditing === true;
    return true;
  }

  onEnterPressed(): void {
    if (!this.hasErrors) {
      this.params.stopEditing();
    }
  }

  onEscapePressed(): void {
    this.params.stopEditing(true);
  }

  // Optional: Focus input when editing starts
  afterGuiAttached(): void {
    if (this.isEditing && this.input) {
      this.input.nativeElement.focus();
      this.validateValue();
    }
  }

  onValueChange(): void {


    
    this.validateValue();
    if(!this.currentError){
      (this.params.node as CustomRowNode).error ='';
    }

     // Immediately update node's data while still editing
  const fieldName = this.params.column.getColId();
  this.params.node.setDataValue(fieldName, this.value);
  
  // Force refresh the button cell
  if (this.params.api) {
    this.params.api.refreshCells({
      force: true, 
      rowNodes: [this.params.node],
      columns: ['Actions']
    });
  }
   
   
     
  }


  validateValue(): void {
    // Reset current error
    this.currentError = null;
    const fieldName = this.params.column.getColId();
    // Initialize fieldErrors if doesn't exist
    if (!(this.params.node as CustomRowNode).fieldErrors) {
      (this.params.node as CustomRowNode).fieldErrors = {};
    }
     // Reset current error for this field
    delete (this.params.node as CustomRowNode).fieldErrors[fieldName];

    // Check for empty value if required
    if (this.isRequired && (!this.value || this.value.trim() === '')) {
      this.currentError = {
        type: 'empty',
        message: 'This field is required'
      };
      this.cdr.detectChanges();
       // Persist error state in the row node
       (this.params.node as CustomRowNode).error = this.currentError;
       (this.params.node as CustomRowNode).fieldErrors[fieldName] = this.currentError;
      return;
    }

    // Check max length
    if (this.value && this.value.length > this.maxLength) {
      this.currentError = {
        type: 'maxLength',
        message: `Maximum length of ${this.maxLength} characters exceeded`
      };
      (this.params.node as CustomRowNode).error = this.currentError;
      (this.params.node as CustomRowNode).fieldErrors[fieldName] = this.currentError;
      this.cdr.detectChanges();
      return;
    }


    // Check for letters only if rule is set
    if (this.validationRules.onlyLetters && this.value) {
      if (!/^[a-zA-Z\s]+$/.test(this.value)) {
        this.currentError = {
          type: 'pattern',
          message: this.validationRules.errorMessage || 'Only letters are allowed'
        };
        (this.params.node as CustomRowNode).error = this.currentError;
        (this.params.node as CustomRowNode).fieldErrors[fieldName] = this.currentError;
        this.cdr.detectChanges();
        return;
      }
    }

    // Check for duplicates
    this.checkDuplicates();
  }

  checkDuplicates(): void {
    if (!this.value || this.value.trim() === '') {
      return;
    }

    const columnId = this.params.column.getColId();
    const rowIndex = this.params.rowIndex;
    const allNodes: any[] = [];
    
    this.params.api.forEachNode(node => allNodes.push(node));
    
    const currentRowMetadata = this.params.metadata?.parentField || [];
    
    const isDuplicate = allNodes.some((node, index) => {
      const cellValue = node.data[columnId];
      const isDuplicateValue = cellValue?.toString().toLowerCase().trim() === 
                              this.value.toString().toLowerCase().trim();
      
      if (index !== rowIndex && isDuplicateValue) {
        if (!currentRowMetadata || currentRowMetadata.length === 0) {
          return true;
        }
        
        const isParentMatch = currentRowMetadata.every(parentField => {
          const currentRowParentValue = this.params.data[parentField]?.toString().toLowerCase().trim();
          const nodeParentValue = node.data[parentField]?.toString().toLowerCase().trim();
          
          return currentRowParentValue === nodeParentValue;
        });
        
        return isParentMatch;
      }
      
      return false;
    });

    if (isDuplicate) {
      this.currentError = {
        type: 'duplicate',
        message: 'This value already exists'
      };
      (this.params.node as CustomRowNode).error = this.currentError;
      const fieldName = this.params.column.getColId();
      (this.params.node as CustomRowNode).fieldErrors[fieldName] = this.currentError;
    }

    this.cdr.detectChanges();
  }



  // Prevent non-letter keys
  onKeyDown(event: KeyboardEvent): void {
    console.log('validation', this.validationRules.onlyLetters)
    if(this.validationRules.onlyLetters){
        if (
          !event.key.match(/[a-zA-Z\s]/) && 
          event.key !== 'Backspace'
           && 
          event.key !== 'Tab'
        ) 
            {
                event.preventDefault();
              }
  }
}
}

// (keydown.enter)="onEnterPressed($event)"







