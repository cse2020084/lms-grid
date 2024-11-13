import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-second-custom',
  template: `
  <div class="editor-container">
    <input
      #input
      type="text"
      [(ngModel)]="value"
      (ngModelChange)="checkDuplicates()"
      [class.has-error]="isDuplicate"
      class="ag-input-field-input ag-text-field-input"
    />
    <div *ngIf="isDuplicate" class="duplicate-warning">
      Duplicate value detected!
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
  .duplicate-warning {
    position: absolute;
    bottom: -11px;
    left: 0;
    color: red;
    font-size: 12px;
    background: 0;
    padding: 2px;
    border: 0 solid #ccc;
    z-index: 1000;
    
  }
`]

})
export class SecondCustomComponent implements ICellEditorAngularComp, AfterViewInit {
  @ViewChild('input') input!: ElementRef;
  
  private params: ICellEditorParams;
  private originalValue: any;
  public value: any;
  public isDuplicate: boolean = false;
  
  agInit(params: ICellEditorParams): void {
    console.log('agInit',params)
    this.params = params;
    this.originalValue = params.value;
    this.value = params.value;
  }

  ngAfterViewInit() {
    // Focus on the input element
    setTimeout(() => {
      this.input.nativeElement.focus();
    });
    console.log('ngAfterView',this.params, this.value)
  }

  // Check for duplicates in the column
  checkDuplicates(): void {
    if (!this.value) {
      this.isDuplicate = false;
      return;
    }

    const columnId = this.params.column.getColId();
    const rowIndex = this.params.rowIndex;
    const allNodes: any[] = [];
    
    // Get all row nodes
    this.params.api.forEachNode(node => allNodes.push(node));
    
    // Check for duplicates excluding the current row
    this.isDuplicate = allNodes.some((node, index) => {
      const cellValue = node.data[columnId];
      return index !== rowIndex && 
             cellValue && 
             cellValue.toString().toLowerCase() === this.value.toString().toLowerCase();
    });
  }

  getValue(): any {
    console.log('getValue', this.value)
    return this.value; 
  }

  // Determines if the editor should stay active
  isCancelBeforeStart(): boolean {
    console.log('isCancelBeforeStart')
    return false;
  }

  // Determines if the edit should be canceled
  isCancelAfterEnd(): boolean {
    // Cancel the edit if there's a duplicate value
    console.log('isCancelAfterEnd')
    return this.isDuplicate;
  }

  // Focus and select can be done after the gui is attached
  afterGuiAttached(): void {
    console.log('afterGUI')
    this.input.nativeElement.select();
  }
}