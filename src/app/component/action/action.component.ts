import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { IDetailCellRenderer } from 'ag-grid-community';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-action',
 // templateUrl: './action.component.html',
 template: `
 <ng-container *ngIf="params.data.isNew; else defaultTemplate">
   <button mat-button color="primary" (click)="save()">Save</button>
   <button  mat-button color="primary" (click)="cancel()">Cancel</button>
 </ng-container>
 <ng-template #defaultTemplate>
   <button  mat-button color="accent" (click)="edit()" [disabled]="!isActive">Edit</button>
   <button  mat-button (click)="status()" [ngClass]="{ active: isActive ,inActive:!isActive}" >{{ isActive ? 'Deactivate' : 'Activate' }}</button>
 </ng-template>
`,
styles: [`
   .inActive{
    color:green;
  }
  .active {
   color:red;
   
  }
`]
})
export class ActionComponent implements OnInit,ICellRendererAngularComp {

  public isActive: boolean=true;

  constructor(private dataService:DataService) { }

  ngOnInit(): void {
  }
  public params: any;

  agInit(params: any): void {
    this.params = params;

    this.isActive = this.params.data.activeFlag === 1; // Set isActive based on activeFlag
  }

  save() {
    this.params.context.componentParent.saveRow(this.params.data);
    console.log('save it')
  }

  cancel() {
    this.params.context.componentParent.cancelRow(this.params.data);
    console.log('Cancel it')
  }

  edit() {
    console.log("Edit action triggered");
  //   const item = this.params.data; // Row data to be updated
  //   const updatedRow={genericManipulationRequestEntity: 
  //    {
  //        entityID: item.entityID,
  //        entityBusinessID: item.entityBusinessID,
  //        entityBusinessName: item.entityBusinessName,
  //        entityBusinessShortCode: item.entityBusinessShortCode,
  //        auditAction: 'U',
  //        companyID: 1,
  //        createdBy: 1,
  //        mode: 'W'
  //   }
  //  }
  //    this.dataService.saveRowData(item,'countryservice/updateEntity/', updatedRow).then(
  //      response => {
  //        console.log('Row posted successfully!', response);
  //        alert('Row updated successfully!');
  //      },
  //      error => {
  //        console.error('Error posting row data', error);
  //      }
  //    );

    
     this.params.context.componentParent.editRow(this.params.data);

  }

  
  status() {
    console.log("Toggle action triggered");
    // this.isActive=!this.isActive

    // Notify the parent component about the toggle action
    if(this.isActive) this.params.context.componentParent.deactivateRow(this.params.data);
    else this.params.context.componentParent.activateRow(this.params.data);

    // if(this.isActive) this.deactivateRow(this.params.data)
    // else this.activateRow(this.params.data)

    this.isActive=!this.isActive
  }



  // activateRow(item){
  
  //   const payload= {
  //     genericManipulationRequestEntity: {
  //       entityID: item.entityID,
  //       entityBusinessID: item.entityBusinessID,
  //       entityBusinessName: item.entityBusinessName,
  //       entityBusinessShortCode: item.entityBusinessShortCode,
  //       auditAction: 'A',
  //       companyID: 1, //auth.service
  //       createdBy: 1, //auth.service
  //       mode: 'W'
  //     }
  //   }
  
  //   this.dataService.saveRowData(item,'countryservice/activateEntity',payload).then(
  //     (result)=>{
  //       console.log('activated successfully', result)
  //       item.activeFlag = 1;
  //     //  this.gridApi.refreshCells({ rowNodes: [item], force: true });
  //     alert('Row activated successfully!');
  //     },
  //     (error)=>{
  //       console.log('activation error',error)
  //     }
  //   )
    
  //   // this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
  //   // this.gridApi.refreshCells({    
  //   //   force: true,
  //   // });
  
  
  
  // }
  
  
  // deactivateRow(item){
  //   const payload= {
  //     genericManipulationRequestEntity: {
  //       entityID: item.entityID,
  //       entityBusinessID: item.entityBusinessID,
  //       entityBusinessName: item.entityBusinessName,
  //       entityBusinessShortCode: item.entityBusinessShortCode,
  //       auditAction: 'D',
  //       companyID: 1, //auth.service
  //       createdBy: 1, //auth.service
  //       mode: 'W'
  //     }
  //   }
  
  //   this.dataService.saveRowData(item,'countryservice/deactivateEntity',payload).then(
  //     (result)=>{
  //       console.log('deactivated successfully', result)
  //       item.activeFlag = 0;
  //       alert('Row deactivated successfully!');
  
  //      // this.gridApi.refreshCells({ rowNodes: [item], force: true });
  //     },
  //     (error)=>{
  //       console.log('deactivation error',error)
  //     }
  //   )
  //   // this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
  //   // this.gridApi.refreshCells({    
  //   //   force: true,
  //   // });
  // }


  refresh(params: any): boolean {
    this.params = params;
    // this.isActive = this.params.data.activeFlag === 1;
    return true;

  }

}
