import { Component, OnInit,ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {  ColDef, GridApi } from 'ag-grid-community';
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

    // cellStyle: params => {
    //   const style = {}; // Starting with an empty object
    
    //   // Apply padding if the row is new
    //   if (params.data.isNew) {
    //     style['padding'] = '10px';
    //   }
    //   // Add red border for duplicates
    //   console.log(params)
    //   console.log(params.data.duplicateField === params.colDef.field && params.data.duplicateError)

    //   const bool=params.data.duplicateError
    //   console.log(params.data.duplicateField === params.colDef.field)
    //   if (params.data.duplicateField === params.colDef.field && params.data.duplicateError) {
    //     console.log('hi')
    //     style['border'] = '2px solid red';
    //   }else{
    //     style['border'] = '1px none blue';
    //   }
      
    //   return style;
    // }

   

    
    
    
   },
    { headerName: 'Abbreviation', field: 'entityBusinessShortCode', editable: true,
    //    cellStyle: params => params.data.isNew ? { padding: '10px', borderBottom: '2px solid #ccc' } : {},
    // cellRenderer: params => params.data.isNew ? `<input placeholder="Enter Abbreviation" />` : params.value,
    // cellClass: params => params.data.isNew ? 'ag-row ag-row-new isNew' : '', 

    // cellStyle: params => {
    //   return params.data.isNew ? { padding: '10px' } : {};
    // },
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
    //cellStyle: params => params.data.isNew ? { padding: '10px' } : {},
    // cellStyle: params => {
    //   const style = {}; // Starting with an empty object
    
    //   // Apply padding if the row is new
    //   if (params.data.isNew) {
    //     style['padding'] = '10px';
    //   }
    //   // Add red border for duplicates
     
    //   if (params.data.duplicateError) {
    //     style['border'] = '2px solid red';
    //   }
      
    //   return style;
    // }
    },
    { headerName: 'Last Updated By', field: 'createdByUser' ,},
    { headerName: 'Last Modified on', field: 'effectiveDateFrom', },
    // {
    //   headerName: 'Update',
    //   cellRenderer: 'updateRenderer',
     
    // },
    {
      headerName: 'Actions',
      cellRenderer: 'actionCellRenderer', // Uses custom cell renderer for actions
      editable: false,
      // cellClass: params => params.data.isNew ? 'ag-row ag-row-new isNew' : '',
      // cellStyle: params => params.data.isNew ? { padding: '10px' } : {},
      
      
    }
  ];





  // Default column settings for AG Grid
  public defaultColDef = {
     //flex: 1,
      resizable: true
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
      },
      error => {
        console.error('Error saving row:', error);
      }
    ).catch((errorMessage) => {
      console.log('error ..')
    });

    this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
    this.loadData();
    this.cdr.markForCheck();  // Manually trigger change detection
    this.clickedOnCreateButton=false; // to enable create button again
    this.gridApi.refreshCells({
      
      force: true,
    });
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


 


  // Update row data on server when a cell value is changed
  


  // check uniqueness in data 
  // onCellValueChanged(event) {
  //   const editedField = event.colDef.field;
  //   const editedValue = event.data[editedField];
  //   let duplicate = false;
  //   console.log(duplicate)
  //   // Check for duplicates for specified unique fields
  //   if (['entityBusinessName', 'entityBusinessShortCode'].includes(editedField)) {
  //     duplicate = this.rowData.some(row => row[editedField] === editedValue && row !== event.data);
      
      
  //     // Set error and message based on which field has a duplicate
      
  //     if (duplicate) {
  //       console.log('just checking duplicacy')
        
  //       this.duplicateError = true;
  //       // this.duplicateMessage = `${editedField === 'entityBusinessName' ? 'Entity Business Name' : 'Entity Business Short Code'} already exists`;
  //       this.duplicateMessage = `data already exists`;

  //       this.cdr.detectChanges();
            
  //           // Force cell refresh to display the duplicate message
  //           this.gridApi.refreshCells({
  //               rowNodes: [this.gridApi.getDisplayedRowAtIndex(event.node.rowIndex)],
  //               // rowNodes: [event.node],
  //               columns: [editedField],
  //               force: true
  //           });
        
  //     } else {
  //       this.duplicateError = false;
  //       this.duplicateMessage = '';
       
  //     }
  
  //     // Trigger change detection to update the UI immediately
  //     console.log('duplicacy check',duplicate,this.duplicateError)
  //     //this.cdr.markForCheck();
  //     this.cdr.detectChanges();
  //   }
  // }

///break
 
  // onCellValueChanged(event) {

  //   const editedField = event.colDef.field;
  //   const editedValue = event.data[editedField];
  
  //   // Clear warning for the edited field initially
  //   event.data[`${editedField}Warning`] = '';
  //   event.data.duplicateError = false; // Reset duplicate error flag
  //   event.data.duplicateField = null; // Clear any previous duplicate field


  //   // Check if there is a duplicate only in the column being edited
  //   const isDuplicate = this.rowData.some(
  //     row => row[editedField] === editedValue && row !== event.data
  //   );
  
  //   // If a duplicate is found, set the warning message for this column
  //   if (isDuplicate) {
  //     event.data[`${editedField}Warning`] = 'Data already exists';
  //     event.data.duplicateError = true;
  //     event.data.duplicateField = editedField; // Track the field with the error

  //   }
    
    
  //   // Debugging console log to verify warning status
  //   console.log(`${editedField} warning:`, event.data[`${editedField}Warning`]);
    
  
  //   // Refresh the entire row to display the warning properly
  //   if (isDuplicate || event.data[`${editedField}Warning`] === '') {
  //   this.gridApi.refreshCells({
  //     rowNodes: [event.node],
  //     columns: [editedField], 
  //     force: true,
      
  //   });
  // }
  //   if(event.data[`${editedField}Warning`]!=='') this.eventDataWarning=true
   

    

    
  // }




// New onCellValueChanged method
// onCellValueChanged(params: any) {
//   const updatedValue = params.data.countryCode;
//   const columnField = params.colDef.field;

//   // Loop through all rows to check for duplicates
//   const duplicateExists = this.rowData.some((row: any) =>
//     row !== params.data && row[columnField] === updatedValue
//   );

//   // Apply style based on duplication
//   params.node.setDataValue(
//     columnField,
//     updatedValue
//   );

//   params.api.refreshCells({
//     force: true,
//     columns: [columnField]
//   });
// }


  
  
  
  





// only for duplicacy check
  // checkForDuplicates(entityBusinessName: string, entityBusinessShortCode: string): boolean {
  //   return this.rowData.some(
  //     (row) =>
  //       row.entityBusinessName === entityBusinessName ||
  //       row.entityBusinessShortCode === entityBusinessShortCode
  //   );
  // }

  ///check
  checkForDuplicates(value: string, field: string,currentRowId:string): boolean {
    return this.rowData.some(
      row => row[field] === value && row.id !== currentRowId
    );
    console.log('values are: '+value,field,currentRowId)
  }


  // Add this method in app.component.ts
// getRowStyle = (params) => {
//   // Apply custom styles only for the temporary row
//   if (params.data.isNew) {
//     //return { height: '60px', padding: '10px 0' }; // Adjust height and padding as needed
//     return { 
//       height: '30px',         // Increase row height for the temporary row
//       zIndex: 1,              // Bring the row to the front visually
//       backgroundColor: '#f9f9f9',  // Optional: background color for emphasis
//       paddingTop: '10px',     // Space between text and row border
//       paddingBottom: '10px'
//     };
//   }
//   return null;
// };

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
  }
  //getRowStyle: this.getRowStyle,

  // have added this below
  
  //getRowClass: params => params.data?.rowClass || '', // Apply 'ag-temporary-row' if present
 // domLayout: 'autoHeight',
  
    //suppressHorizontalScroll: false,
  // alwaysShowHorizontalScroll:true,
    
  // alwaysShowVerticalScroll:true,

};

}

// ${params.context.componentParent.duplicateMessage}
