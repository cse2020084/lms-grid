import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-button-cell-renderer',
  template: `
    <div *ngIf="!params.node.isEditing && !params.data.isNew">
      <button mat-button (click)="onEdit()" [disabled]="isAnyRowEditing() || params.data.activeFlag!==1"><img class="edit-icon" src="../../../assets/edit.svg" alt="Edit"></button>
      <button mat-button *ngIf="!isAnyRowEditing()"  (click)="status()" [ngClass]="{ active: params.data.activeFlag === 1 ,inActive:params.data.activeFlag !== 1}" ><img *ngIf="params.data.activeFlag ===1" class="fas fa-ban" src="../../../assets/deactivate.svg"><img *ngIf="params.data.activeFlag !==1" class="fas fa-ban" src="../../../assets/activate.svg"></button>
    </div>
    <div *ngIf="params.node.isEditing || params.data.isNew">
      <button mat-button color="success" [disabled]="hasErrors()"  (click)="onSave()"><i class="bi bi-check-circle-fill"></i></button>
      <button mat-button color="warn" (click)="onCancel()"> <i class="bi bi-x-circle-fill"></i> </button>
    </div>
  `,
  styles: [`
    button {
      margin-right: 5px;
    }

    .bi{
    font-size:1.3rem;
     
    }

     .bi-check-circle-fill{
    // color:green;
    }
    
     .inActive{
    color:green;
    font-size:0.5rem;
  }
  .active {
   color:rgb(211, 47, 47);
   font-size:0.2rem;
}
  .fas{
  max-width:20px;
  max-height:20px;
  padding:0;
  
}

.edit-icon{
  max-width:20px;
  max-height:20px;
}
  `]
})
export class ButtonCellRendererComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: any): void {
    this.params = params;

  

 

  
  }

  refresh(): boolean {
    // Force refresh when editing state changes
  if (this.params.node.isEditing !== undefined) {
    return true;
  }
    return false; // No need to refresh
  }

  isAnyRowEditing():boolean{
    let isInEditing=false;
   // this.params.context.componentParent.populateDepartment()
    this.params.api.forEachNode((node)=>{
      if (node.isEditing || node.data.isNew) {
        isInEditing = true;
      }
    })
    return isInEditing;
  }

  hasErrors(): boolean {
    const node = this.params.node;
    const rowData = node.data;
    
    // Check required fields and validation errors
    for (const col of this.params.columnApi.getAllColumns()) {
      const colDef = col.getColDef();
      if (colDef.required) {
        const value = rowData[colDef.field];
        // Check if field is empty or has errors
        if (!value || value.toString().trim() === '' || node.fieldErrors?.[colDef.field]) {
          return true;
        }
      }
    }
    return false;
  }








  

   onEdit() {
    const rowNode = this.params.node;

    rowNode.originalData=  { ...rowNode.data }; // Deep copy the original row data
    // First set loading state and trigger department list load

     // Helper function for common editing logic
  const startEditing = () => {
    rowNode.isEditing = true; // Add custom property to rowNode
    rowNode.setRowHeight(80);// Set row height
    this.params.api.onRowHeightChanged();// Refresh the grid
    
    // Force a refresh of the grid to apply `editable`
    this.params.api.refreshCells({
      force: true, // Ensures cells are re-rendered
      rowNodes: [rowNode], // Only refresh the affected row
    });
  };


    // Check if loadDepartmentsForEdit exists in parent
  if (this.params.context?.componentParent?.loadDepartmentsForEdit) {
    // If exists, use the original approach with Promise
    this.params.context.componentParent.loadDepartmentsForEdit(false).then(startEditing);
  } else {
    // If method doesn't exist, directly proceed with editing
    startEditing();
  }
    
 

    //  setTimeout(() => {
    //   this.params.api.startEditingCell({
    //     rowIndex: rowNode.rowIndex,
    //     //colKey: 'name'  // this should match your column field name
    //   });
      
    // });



  }

  onSave(): void {
    const rowNode = this.params.node;
    rowNode.isEditing = false;
    rowNode.setRowHeight(50); // Reset row height
    this.params.api.onRowHeightChanged();

    if (this.params.onSave) {
      console.log(this.params)
      if(this.params.data.isNew) this.params.onSave(this.params.data);
      else this.params.context.componentParent.updateRow(this.params.data);
    }

    this.params.api.refreshCells({
      force: true, // Ensures cells are re-rendered
      rowNodes: [rowNode], // Only refresh the affected row
    });
  }

  onCancel(): void {
    const rowNode = this.params.node;
    
    if (this.params.data.isNew) {
      // Call the parent's onCancelInsert method
      this.params.onCancel();
    } else {
      // Existing cancel logic for edit mode
      rowNode.isEditing = false;
      if (rowNode.originalData) {
        Object.assign(rowNode.data, rowNode.originalData);
      }
      rowNode.setRowHeight(50);
      this.params.api.onRowHeightChanged();
      
      
      this.params.api.refreshCells({
        force: true,
        rowNodes: [rowNode],
      });
    }

  }

  status(){
    console.log(this.params)

    if(this.params.data.activeFlag === 1) this.params.context.componentParent.deactivateRow(this.params.data);
    else this.params.context.componentParent.activateRow(this.params.data);

    
  }
}
