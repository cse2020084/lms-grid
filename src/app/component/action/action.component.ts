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
   <button  mat-button color="accent" (click)="edit()">Edit</button>
   <button  mat-button color="warn" (click)="delete()">Status</button>
 </ng-template>
`,
  styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit,ICellRendererAngularComp {

  constructor(private generalMasterService:DataService) { }

  ngOnInit(): void {
  }
  public params: any;

  agInit(params: any): void {
    this.params = params;
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
    const rowData = this.params.data; // Row data to be updated
    const updatedRow={genericManipulationRequestEntity: 
     {
         entityID: rowData.entityID,
         entityBusinessID: rowData.entityBusinessID,
         entityBusinessName: rowData.entityBusinessName,
         entityBusinessShortCode: rowData.entityBusinessShortCode,
         auditAction: 'U',
         companyID: 1,
         createdBy: 1,
         mode: 'W'
    }
   }
     this.generalMasterService.saveRowData(rowData,'countryservice/updateEntity/', updatedRow).then(
       response => {
         console.log('Row posted successfully!', response);
         alert('Row updated successfully!');
       },
       error => {
         console.error('Error posting row data', error);
       }
     );

    
  }

  delete() {
    console.log("Delete action triggered");
  }

  refresh(params: any): boolean {
    return true;
  }

}
