import { Component, ElementRef, OnInit, ViewChild,ChangeDetectorRef, HostListener } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import {  GridOptions, ICellEditorParams } from 'ag-grid-community';

@Component({
  selector: 'app-custom-text-cell-editor',
  template: `
    <div class="custom-editor-container">
      <input
        #input
        [(ngModel)]="value"
        [placeholder]="placeholder"
        (ngModelChange)="onValueChange()"
        (keydown.enter)="onEnterPressed($event)"
        
        class="custom-input"
      />
      <div *ngIf="isDuplicate" class="duplicate-warning">
        {{ duplicateMessage }}
      </div>
    </div>
  `,
  styles: [
    `
      .custom-editor-container {
        padding: 8px;
        padding-top:0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        
      }
      .custom-input {
        width: calc(100% - 16px); /* Ensure input doesn’t touch borders */
        padding: 8px;
        padding-top:0;
        font-size: 14px;
        margin-bottom: 4px; /* Space for warning message */
      }
      .duplicate-warning {
        color: red;
        font-size: 12px;
        
      }
    `
  ]
})
export class CustomTextCellEditor implements ICellEditorAngularComp {
  @ViewChild('input', { static: true }) input!: ElementRef;
  public value: string = '';
  public isDuplicate: boolean = false;
  public placeholder: string = '';
  public duplicateMessage: string = '';

  constructor(private cdr: ChangeDetectorRef


  ) {
    
  }

 

  // Enable single-click editing
  gridOptions: GridOptions = {
    singleClickEdit: true,
  };
  

  private params: any;
  ngOnInit() {
    this.checkForDuplicates(); // Initial check for duplicates
    
  }
 
  agInit(params: ICellEditorParams & { placeholder: string }): void {
   // this.onEnterPressed(params)
   
    this.params = params;
    console.log('inside agInit',this.params)
    this.value = this.params.value || '';
    
    this.placeholder = this.params.placeholder || '';



    console.log( "param value",this.params.value)

    /// Reset duplicate flags when editor initializes
    this.isDuplicate = false; 
    this.duplicateMessage = '';
    this.params.data.duplicateError = false;
    this.params.data.duplicateField = null;

    // Run an initial duplicate check
    this.checkForDuplicates();
  }

  getValue() {
    console.log('value is ',this.value)
    return this.value;  // Ensures value is passed back to the grid
  } 


  // Method to check for duplicates and update `isDuplicate`
  onValueChange() {
    //this.updateRowData(); // Update the grid's rowData on each keystroke
    this.checkForDuplicates(); // Check for duplicates dynamically
    this.cdr.detectChanges();  // Trigger change detection manually
  }


  
  onEnterPressed(params): void {
    console.log('enter get pressed')
    // this.params = params;
    
    if(params.value!=='') params.value=''
    if(this.params.value!=='') this.params.value=''
    //if(this.value!=='') this.value=''

    console.log(this.params.value)

    this.params.api.stopEditing();
    // this.params = params;
    // this.value = this.params.value || '';
    if(params.value!=='') params.value=''
    if(this.params.value!=='') this.params.value=''

    console.log(params.value,this.params.value)

  }


  // Update `rowData` immediately within grid on each keystroke
  // updateRowData() {
  //   this.params.data[this.params.colDef.field] = this.value;
  //   // this.params.api.refreshCells({ rowNodes: [this.params.node] }); // Refresh the cell to display updated data
  // }




  // Check if the current value duplicates any other values in the column
  checkForDuplicates() {
    if (this.value) {
      const isDuplicate = this.params.context.componentParent.checkForDuplicates(
        this.value,
        this.params.colDef.field,
        this.params.node.id
      );
      this.isDuplicate = isDuplicate;
      this.duplicateMessage = isDuplicate ? `${this.params.colDef.headerName} already exists` : '';
      
      // Update `duplicateError` flag in the main component row data for consistency
      this.params.data.duplicateError = isDuplicate;
      ///
      this.params.data.duplicateField = isDuplicate ? this.params.colDef.field : null;
    } else {
      this.isDuplicate = false;
      this.duplicateMessage = '';
      this.params.data.duplicateError = false;
      ///
      this.params.data.duplicateField = null;
    }

    ///
    this.params.api.refreshCells({
      rowNodes: [this.params.node],
      columns: [this.params.colDef.field],
      force: true,
  });
  }

 // Handles the Enter key press to stop editing and trigger getValue
 
// Trigger save on Enter key press
onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    this.params.api.stopEditing();
  }
}

 afterGuiAttached() {
   this.input.nativeElement.focus();
  //setTimeout(() => this.input.nativeElement.focus());


  // // Simulate an Enter key press without stopping editing
  // const enterEvent = new KeyboardEvent('keydown', {
  //   key: 'Enter',
  //   code: 'Enter',
  //   keyCode: 13, // Enter key code
  //   bubbles: true
  // });
  // this.input.nativeElement.dispatchEvent(enterEvent);

 }





}


// (keydown.enter)="onEnterPressed($event)"








