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
   <button  mat-button color="accent" (click)="edit()" [disabled]="params.data.activeFlag !== 1">Edit</button>
   <button  mat-button (click)="status()" [ngClass]="{ active: params.data.activeFlag === 1 ,inActive:params.data.activeFlag !== 1}" > {{ params.data.activeFlag === 1 ? 'Deactivate' : 'Activate' }}</button>
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

    // this.updateActiveState();
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
  

    
     this.params.context.componentParent.editRow(this.params.data);

  }

  
  



  


  refresh(params: any): boolean {
    this.params = params;
    
    return true;

  }

  private updateActiveState(): void {
    this.isActive = this.params.data.activeFlag === 1; // Update isActive based on parent-provided data
  }

  status() {
    console.log("Toggle action triggered");
    this.isActive=!this.isActive

    // Notify the parent component about the toggle action
    if(this.params.data.activeFlag === 1) this.params.context.componentParent.deactivateRow(this.params.data);
    else this.params.context.componentParent.activateRow(this.params.data);

    // if(this.isActive) this.deactivateRow(this.params.data)
    // else this.activateRow(this.params.data)

    }

}
