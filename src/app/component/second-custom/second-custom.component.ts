import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-second-custom',
  template: `
  <div class="editor-container"  (mousedown)="onMouseDown($event)" (click)="onEditorClick($event)">
    <input
      #input
      type="text"
      [(ngModel)]="value"
      (ngModelChange)="checkDuplicates()"
      [class.has-error]="isDuplicate"
      class="ag-input-field-input ag-text-field-input"
      (keydown)="onKeyDown($event)"
      
      (blur)="onBlur($event)"
      
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

  //private isDestroyed: boolean = false;
  private isEditing: boolean = false;
  private isFirstClick: boolean = true;
  
  agInit(params: ICellEditorParams): void {
    console.log('agInit',params)
    this.params = params;
    this.originalValue = params.value;
    this.value = params.value;

    // Set editing started flag
    window.setTimeout(() => {
      this.isEditing = true;
    }, 100);
  }

  ngAfterViewInit() {
    // Focus on the input element
    // setTimeout(() => {
    //   if (!this.isDestroyed) {
    //   this.input.nativeElement.focus();
    //   }
    // });

    window.setTimeout(() => {
      this.input.nativeElement.focus();
      this.input.nativeElement.select();
    });
    console.log('ngAfterView',this.params, this.value)
  }


  // Prevent default mouse behavior
   // Prevent default mouse behavior on the first click
 
  onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    if (this.isFirstClick) {
      event.preventDefault();
    }
  }

  // Handle editor clicks, stop propagation
  onEditorClick(event: MouseEvent): void {
    event.stopPropagation();
    this.isFirstClick = false;
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
             cellValue.toString().toLowerCase().trim() === this.value.toString().toLowerCase().trim();
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

  // isPopup(): boolean {
  //   // This tells AG Grid that our editor is a popup
  //   // which helps with click event handling
  //   return true;
  // }

  // Handle blur events
  onBlur(event:FocusEvent): void {
    // Only stop editing if we're actually editing and not handling the first click
    // if (this.isEditing && !this.isDuplicate) {
    //   // Small timeout to allow for other click events to process
    //   setTimeout(() => {
    //     if (!this.isDestroyed && this.isEditing) {
    //       this.params.api.stopEditing();
    //     }
    //   }, 100);
    // }

    ///
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!relatedTarget || !this.isTargetInGrid(relatedTarget)) {
      this.params.api.stopEditing();
    }
  }
  private isTargetInGrid(element: HTMLElement): boolean {
    return !!element?.closest('.ag-root-wrapper');
  }


  // Handle keydown events
  onKeyDown(event: KeyboardEvent): void {
    // if (event.key === 'Enter') {
    //   this.params.api.stopEditing();
    //   event.preventDefault();
    // } else if (event.key === 'Escape') {
    //   this.value = this.originalValue;
    //   this.params.api.stopEditing();
    //   event.preventDefault();
    // }


    ///
    if (event.key === 'Enter') {
      if (!this.isDuplicate) {
        this.params.api.stopEditing();
      }
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.value = this.originalValue;
      this.params.api.stopEditing();
      event.preventDefault();
    }
  }

  ///
  // ngOnDestroy() {
  //   //this.isDestroyed = true;
  //   this.isEditing = false;
  // }


  ///


  // Focus and select can be done after the gui is attached
//   afterGuiAttached(): void {
//     console.log('afterGUI')
//     if (!this.isDestroyed) {
//     this.input.nativeElement.select();
//   }
// }


// This is crucial for AG Grid v27
// focusIn(): void {
//   window.setTimeout(() => {
//     this.input.nativeElement.focus();
//     this.input.nativeElement.select();
//   });
// }

// focusOut(): void {
//   this.input.nativeElement.blur();
// }

private focusOnInput(): void {
  this.input.nativeElement.focus();
  this.input.nativeElement.select();
}
}