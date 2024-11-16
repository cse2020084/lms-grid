import { Component, OnInit,ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {  ColDef, GridApi, RowClassRules } from 'ag-grid-community';
import { ActionComponent } from './component/action/action.component';
import { DataService } from './services/data.service';
import { CustomTextCellEditor } from './component/custom-text-cell-editor/custom-text-cell-editor.component';
import { SecondCustomComponent } from './component/second-custom/second-custom.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Adding Change Detection Strategy
})
export class AppComponent implements OnInit {


  constructor(
    private dataService: DataService,
    // private authService: AuthService,
    private cdr: ChangeDetectorRef,
    ) {}



  
  
  public rowData: any[]=[];          // Data to be displayed in AG Grid
  public gridApi!: GridApi;
  public gridColumnApi: any;
  public isCreatingNewRow: boolean = false; // Flag to track row creation state
  public duplicateError: boolean = false; // Flag to track if a duplicate is found
  
  public duplicateMessage: string = ''; // Message for duplicate warning ,borderBottom: '2px solid #ccc'
  public clickedOnCreateButton:boolean=false; //for disabling other button
  public eventDataWarning=false;

  public isActive:boolean=true;




  public columnDefs: ColDef[] = [
    {
       headerName: 'Country Name', field: 'entityBusinessName', editable: true,

    cellRenderer: params => {
      if (params.data.isNew) {
        const warning = params.data[`${params.colDef.field}Warning`];
        return `
          <div class="custom-cell-renderer">
            <input 
              value="${params.value || ''}"
              placeholder="Enter Country"
              style="width: calc(100% - 20px); padding: 8px; font-size: 14px; }"
            />
            <div class="duplicate-warning" style="color: red; font-size: 12px;">
            ${warning || ''}
            </div>
          </div>
        `;
      }
      return params.value;
    },

    cellEditor: 'customTextCellEditor',
    // cellClassRules: {   
      
    //     'deactivated-row': (params) => params.data.activeFlag !== 1
      
    // },


    
    
    
   },
    { headerName: 'Abbreviation', field: 'entityBusinessShortCode', editable: true,
   
    cellRenderer: params => {
      if (params.data.isNew) {
        return `
          <div class="custom-cell-renderer">
            <input 
              value="${params.value || ''}"
              placeholder="Enter Abbreviation"
              style="width: calc(100% - 20px); padding: 8px; font-size: 14px;"
            />
            <div class="duplicate-warning" style="color: red; font-size: 12px;">
            ${params.context.componentParent.duplicateMessage}
            </div>
          </div>
        `;
      }
      return params.value;
    },
    cellEditor: 'customTextCellEditor',
    cellEditorParams: {
      placeholder: 'Enter Abbreviation'
    },
    // cellClassRules: {        
    //   'deactivated-row': (params) => params.data.activeFlag !== 1
    // },
    

    },
    { 
      headerName: 'Last Updated By', field: 'createdByUser' ,
      cellClassRules: {       
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },
    },
    { 
      headerName: 'Last Modified on', field: 'effectiveDateFrom',cellClassRules: {   
      'deactivated-row': (params) => 
        params.data.activeFlag !== 1


      
    },
  },
 
    {
      headerName: 'Actions',
      cellRenderer: 'actionCellRenderer', // Uses custom cell renderer for actions
      
      cellRendererParams: {
        activateRow: this.activateRow.bind(this),
        deactivateRow: this.deactivateRow.bind(this)
      }
      
    }
  ];





  // Default column settings for AG Grid
  public defaultColDef = {
     //flex: 1,
      resizable: true,
      
    };
   // Register framework components, such as custom cell renderers
  public frameworkComponents = { actionCellRenderer: ActionComponent,
    // customTextCellEditor: CustomTextCellEditor
    customTextCellEditor:SecondCustomComponent
  };


  ngOnInit(){
    //this.loadData()
  }

  /**
   * Retrieves data from the server and loads it into the grid.
   */
  loadData() {
    
    const payload = {
      genericRequestEntity: {
        companyID: 1,
         createdBy: 1,
        mode: 'W',
        detailFlag: false,
        dropDown: false
      
    }
    };
    this.dataService.retrieveData('countryservice/getAllCountry',payload)
    .subscribe(
      (records: any) => {
        
        // Check if the API call was successful
        if (records.statusCode === "200" || records.statusCode === "300") {
          // Update rowData with the data received from the server
          this.rowData = records.responseList || [];
          this.gridApi.setRowData(this.rowData); // Update the grid with new data
        } else {
          console.error('Error:', records.errorMessage);
        }
      },
      error => {
        console.error('Network or server issue:', error);
      }
    );

  }

   /**
   * Initializes grid API and loads data after the grid is ready.
   * @param params Grid parameters
   */
   onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;

    // Load data into grid once it's fully initialized
    this.loadData();
  }






  /**
   * Adds a new row to the top of the grid.
   */
  addNewRow() {
    this.clickedOnCreateButton=true; // // to disable create button 
    const newItem = {
      entityBusinessName: '',
      entityBusinessShortCode: '',
      isNew: true,
      rowClass: 'ag-temporary-row' // Apply a custom class for styling
    };
    this.rowData.unshift(newItem);
     // Refresh grid to display the new row
     
     this.gridApi.setRowData(this.rowData); // Refresh grid to display the new row
    this.isCreatingNewRow = true; // Set flag to indicate a new row is being created
    
  }




  /**
   * Saves the data for a new row by sending it to the server.
   * @param item The new row data to save.
   */
  saveRow(item) {
    console.log(item.entityBusinessName)
    console.log(item.entityBusinessShortCode)

    if (!item.entityBusinessName || !item.entityBusinessShortCode) {
      console.error('Error saving row: Mandatory Field is NULL');
      return;
  }
    const payload = {
      genericManipulationRequestEntity: {
        companyID: 1,
        createdBy: 1,
        entityBusinessName: item.entityBusinessName,
        entityBusinessShortCode: item.entityBusinessShortCode,
        auditAction: 'C',
        mode: 'W'
      }
    }
    console.log("item to be sent:", item);

    // if (this.checkForDuplicates(item.entityBusinessName, item.entityBusinessShortCode)) {
    //   alert('Duplicate country name or code found. Please enter unique values.');
    //   return;
    // }

   

    this.dataService.saveRowData(item,'countryservice/createEntity',payload).then(
      (result) => {
        item.isNew = false; // Mark row as saved
        this.isCreatingNewRow = false; // Reset the new row creation flag
        console.log('Row saved successfully');
        this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
        this.loadData();
      },
      error => {
        console.error('Error saving row:', error);
      }
    ).catch((errorMessage) => {
      console.log('error ..')
    });

    // this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
    // this.loadData();
    this.cdr.markForCheck();  // Manually trigger change detection
    this.clickedOnCreateButton=false; // to enable create button again
    // this.gridApi.refreshCells({
      
    //   force: true,
    // });
  }


  /**
   * Cancels the new row creation by removing it from the grid.
   * @param item The temporary row data to remove.
   */
  cancelRow(item) {
    // Ensure any cell editing is stopped
    this.gridApi.stopEditing(true); // Ends edit mode for the entire grid
    
    const index = this.rowData.indexOf(item);
    if (index > -1) {
      this.rowData.splice(index, 1);
      this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
     
    }
    //this.loadData(); // less efficient approach
    this.isCreatingNewRow = false; // Reset the new row creation flag
    this.duplicateError = false; // Reset the duplicate error flag
    this.duplicateMessage = ''; // Clear duplicate message
    this.clickedOnCreateButton=false; // to enable create button again
  }


// for editing the row
  
  editRow(item){
    const updatedRow={genericManipulationRequestEntity: 
      {
          entityID: item.entityID,
          entityBusinessID: item.entityBusinessID,
          entityBusinessName: item.entityBusinessName,
          entityBusinessShortCode: item.entityBusinessShortCode,
          auditAction: 'U',
          companyID: 1,
          createdBy: 1,
          mode: 'W'
     }
    }
      this.dataService.saveRowData(item,'countryservice/updateEntity/', updatedRow).then(
        response => {
          console.log('Row posted successfully!', response);
          alert('Row updated successfully!');
        },
        error => {
          console.error('Error posting row data', error);
        }
      );
  }

  



  // Method to handle sending updated row data to the backend
  // updateRowInServer(updatedRow: any) {
  //   // Create payload with updated fields
  //   const payload={genericManipulationRequestEntity: 
  //     {
  //         entityID: updatedRow.entityID,
  //         entityBusinessID: updatedRow.entityBusinessID,
  //         entityBusinessName: updatedRow.entityBusinessName,
  //         entityBusinessShortCode: updatedRow.entityBusinessShortCode,
  //         auditAction: 'U',
  //         companyID: 1,
  //         createdBy: 1,
  //         mode: 'W'
  //    }
  //   };

  //   // Send updated data to the server using a service method
  //   this.dataService.saveRowData(updatedRow,'countryservice/updateEntity/',payload).then(
  //     (result) => {
        
  //       console.log('Row saved successfully');
  //     },
  //     error => {
  //       console.error('Error saving row:', error);
  //     }
  //   ).catch((errorMessage) => {
  //     console.log('error ..')
  //   });
  // }

  ///

activateRow(item){
   
  const payload= {
    genericManipulationRequestEntity: {
      entityID: item.entityID,
      entityBusinessID: item.entityBusinessID,
      entityBusinessName: item.entityBusinessName,
      entityBusinessShortCode: item.entityBusinessShortCode,
      auditAction: 'A',
      companyID: 1, //auth.service
      createdBy: 1, //auth.service
      mode: 'W'
    }
  }

  this.dataService.saveRowData(item,'countryservice/activateEntity',payload).then(
    (result)=>{
      console.log('activated successfully', result)
      //item.activeFlag = 1;
      this.gridApi.refreshCells({ rowNodes: [item], force: true });
      this.loadData()
    },
    (error)=>{
      console.log('activation error',error)
    }
  )
  
  this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
  this.gridApi.refreshCells({    
    force: true,
  });



}


deactivateRow(item){
  const payload= {
    genericManipulationRequestEntity: {
      entityID: item.entityID,
      entityBusinessID: item.entityBusinessID,
      entityBusinessName: item.entityBusinessName,
      entityBusinessShortCode: item.entityBusinessShortCode,
      auditAction: 'D',
      companyID: 1, //auth.service
      createdBy: 1, //auth.service
      mode: 'W'
    }
  }

  this.dataService.saveRowData(item,'countryservice/deactivateEntity',payload).then(
    (result)=>{
      console.log('deactivated successfully', result)
      //item.activeFlag = 0;
      this.loadData()
      this.gridApi.refreshCells({ rowNodes: [item], force: true });
    },
    (error)=>{
      console.log('deactivation error',error)
    }
  )
  this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
  this.gridApi.refreshCells({    
    force: true,
  });
}
 


  
public clickOnCreatedRow(){
  this.clickedOnCreateButton=true;
}


 //making this component the parent one
 public gridOptions = {
  context: { componentParent: this },
  getRowClass: params => {
    return  params.data && params.data.isNew ? 'ag-temporary-row' : ''; // Apply temporary row class
  },
  getRowHeight: params => {
    return params.data.isNew ? 100 : 50; // Set 80px for temporary row, 40px for normal rows
  },
  
};

}


