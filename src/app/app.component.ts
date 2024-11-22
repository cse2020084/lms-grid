import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ColDef, GridApi, PaginationNumberFormatterParams, RowClassRules } from 'ag-grid-community';
import { ActionComponent } from './component/action/action.component';
import { DataService } from './services/data.service';
//import { CustomTextCellEditor } from './component/custom-text-cell-editor/custom-text-cell-editor.component';
import { SecondCustomComponent } from './component/second-custom/second-custom.component';
import { ClearableFloatingFilterComponent } from './component/clearable-floating-filter/clearable-floating-filter.component';
import 'ag-grid-enterprise';
import { generatePDF } from '../script/jspdf'
import { LoaderService } from './services/loader.service';
import { ToasterService } from './toaster/toaster.service';



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
    private loader:LoaderService,
    private toasterService: ToasterService,
  ) { }




  loading$ = this.loader.loading$;
  public rowData: any[] = [];          // Data to be displayed in AG Grid
  public gridApi!: GridApi;
  public gridColumnApi: any;
  public isCreatingNewRow: boolean = false; // Flag to track row creation state
  public duplicateError: boolean = false; // Flag to track if a duplicate is found

  public duplicateMessage: string = ''; // Message for duplicate warning ,borderBottom: '2px solid #ccc'
  public clickedOnCreateButton: boolean = false; //for disabling other button
  public eventDataWarning = false;

  public isActive: boolean = true;





  public columnDefs: ColDef[] = [
    {
      headerName: 'Country Name', field: 'entityBusinessName', sortable: true, editable: true, width: 250, checkboxSelection: true, headerCheckboxSelection: true,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFilterButton: true, // Removes the default filter button
      },
      floatingFilterComponentFramework: ClearableFloatingFilterComponent,

      cellRenderer: params => {
        if (params.data.isNew) {
          const warning = params.data[`${params.colDef.field}Warning`];
          return `
          <div class="custom-cell-renderer" ;>
            <input 
              value="${params.value || ''}"
              placeholder="Enter Country"
              style="width: calc(100% - 20px); padding: 8px; font-size: 14px;}"
            />
            <div class="duplicate-warning" style="color: red; font-size: 12px;">
            ${warning || ''}
            </div>
          </div>
        `;
        }
        return params.value;
      },
      cellClassRules: {

        'deactivated-row': (params) => params.data.activeFlag !== 1

      },
      cellEditor: 'customTextCellEditor',

    },
    {
      headerName: 'Abbreviation', field: 'entityBusinessShortCode', sortable: true, editable: true, width: 230,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      ///temporary, as i like simple better
      floatingFilterComponentParams: {
        suppressFilterButton: true, // Removes the default filter button
      },
      floatingFilterComponentFramework: ClearableFloatingFilterComponent,

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
      cellClassRules: {
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },


    },
    {
      headerName: 'Last Updated By', field: 'createdByUser', width: 230,
      cellClassRules: {
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },
    },
    {
      headerName: 'Last Modified on', field: 'effectiveDateFrom', width: 330, filter: "agDateColumnFilter", sortable: true, cellClassRules: {
        'deactivated-row': (params) =>
          params.data.activeFlag !== 1



      },
    },

    {
      headerName: '',
      cellRenderer: 'actionCellRenderer', // Uses custom cell renderer for actions
      width: 250,
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
    paginationPageSizeSelector: [8, 10, 20],

  };
  // Register framework components, such as custom cell renderers
  public frameworkComponents = {
    actionCellRenderer: ActionComponent,
    // customTextCellEditor: CustomTextCellEditor
    customTextCellEditor: SecondCustomComponent
  };


  ngOnInit() {
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
    this.loader.showSpinner('Loading data...');
    this.dataService.retrieveData('countryservice/getAllCountry', payload)
      .subscribe(
        (records: any) => {

          // Check if the API call was successful
          if (records.statusCode === "200" || records.statusCode === "300") {
            // Update rowData with the data received from the server
            this.rowData = records.responseList || [];
            this.gridApi.setRowData(this.rowData); // Update the grid with new data
            this.toasterService.showSuccess('Data loaded successfully');
          } else {
            console.error('Error:', records.errorMessage);
            this.toasterService.showError('Failed to load data');
          }
          this.loader.hideSpinner();
        },
        error => {
          this.loader.hideSpinner();
          this.toasterService.showError('Network error occurred');
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
    (document.getElementById("selectedOnly") as HTMLInputElement).checked =
      true;


    // Load data into grid once it's fully initialized

    this.loadData(); // Assuming loadData is asynchronous


  }






  /**
   * Adds a new row to the top of the grid.
   */
  addNewRow() {
    this.clickedOnCreateButton = true; // // to disable create button 
    const newItem = {
      entityBusinessName: '',
      entityBusinessShortCode: '',
      isNew: true,
      activeFlag: 1,
      rowClass: 'ag-temporary-row', // Apply a custom class for styling

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



    this.dataService.saveRowData(item, 'countryservice/createEntity', payload).then(
      (result) => {
        item.isNew = false; // Mark row as saved
        console.log('Row saved successfully');
        this.isCreatingNewRow = false; // Reset the new row creation flag
        this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
        this.toasterService.showSuccess('Data saved successfully');
        this.loadData();
      },
      error => {
        console.error('Error saving row:', error);
        this.toasterService.showError('Not saved')
      }
    ).catch((errorMessage) => {
      console.log('error ..')
      this.toasterService.showError('Not saved')
    });

    // this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
    // this.loadData();
    this.cdr.markForCheck();  // Manually trigger change detection
    this.clickedOnCreateButton = false; // to enable create button again
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
    console.log(this.rowData, index)
    // if (index > -1) {
    this.rowData.splice(0, 1);

    this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData

    // }
    //this.loadData(); // less efficient approach
    this.isCreatingNewRow = false; // Reset the new row creation flag
    this.duplicateError = false; // Reset the duplicate error flag
    this.duplicateMessage = ''; // Clear duplicate message
    this.clickedOnCreateButton = false; // to enable create button again
    this.toasterService.showSuccess('Not added')
  }


  // for editing the row
  public existingName: string = ''
  public existingShortCode: string = ''
  public existingId: string = ''
  editRow(item) {
    console.log('item', item)

    if (this.existingName === item.entityBusinessName && this.existingShortCode === item.entityBusinessShortCode) {
      this.toasterService.showError('Unchanged Data')
      //alert('Value is unchanged')
      return
    }
    const updatedRow = {
      genericManipulationRequestEntity:
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
    this.loader.showSpinner('Data is being Updated');
    this.dataService.saveRowData(item, 'countryservice/updateEntity', updatedRow).then(
      (response: any) => {
        if (response && response.entityID) item.entityID = response.entityID
        this.existingName = response.entityBusinessName
        this.existingShortCode = response.entityBusinessShortCode
        console.log('Row posted successfully!', response);
        this.loader.hideSpinner();
        this.toasterService.showSuccess('Data is updated')
        //alert('Row updated successfully!');
      },
      error => {
        console.error('Error posting row data', error);
        this.loader.hideSpinner();
        this.toasterService.showError('Data is not updated')
      }
    );
  }



  activateRow(item) {

    const payload = {
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
    this.loader.showSpinner('Data is being Activated')
    this.dataService.saveRowData(item, 'countryservice/activateEntity', payload).then(
      (result: any) => {
        console.log('activated successfully', result)
        if (result && result.entityID) item.entityID = result.entityID
        //item.activeFlag = 1;
        // this.gridApi.refreshCells({ rowNodes: [item], force: true });
        // Dynamically update the row data
        item.activeFlag = 1; // Update the activeFlag or other necessary fields
        this.gridApi.applyTransaction({ update: [item] }); // Dynamically update the row
        this.cdr.detectChanges(); // Ensure Angular detects the changes
        this.loader.hideSpinner();
        this.toasterService.showSuccess('Data is now activated')
      },
      (error) => {
        console.log('activation error', error)
        this.loader.hideSpinner();
        this.toasterService.showError('Unchanged Data')
      }
    )

    // this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
    // this.gridApi.refreshCells({    
    //   force: true,
    // });



  }


  deactivateRow(item) {
    const payload = {
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
    this.loader.showSpinner('Data is being Deactivated')
    this.dataService.saveRowData(item, 'countryservice/deactivateEntity', payload).then(
      (result: any) => {
        console.log('deactivated successfully', result)
        if (result && result.entityID) item.entityID = result.entityID
        //item.activeFlag = 0;
        // Dynamically update the row data
        item.activeFlag = 0; // Update the activeFlag or other necessary fields
        this.gridApi.applyTransaction({ update: [item] }); // Dynamically update the row
        //this.gridApi.refreshCells({ rowNodes: [item], force: true });
        this.cdr.detectChanges(); // Ensure Angular detects the changes
        this.loader.hideSpinner();
        this.toasterService.showSuccess('Data is now Deactivated')
      },
      (error) => {
        console.log('deactivation error', error)
        this.loader.hideSpinner();
        this.toasterService.showError('Unchanged Data')
      }
    )
    // this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
    // this.gridApi.refreshCells({    
    //   force: true,
    // });
  }


  updateRowData(rowData: any): void {
    const rowNode = this.gridApi.getRowNode(rowData.id); // Use the ID or unique identifier
    if (rowNode) {
      this.gridApi.applyTransaction({ update: [rowData] }); // Update the grid row data
    }
  }



  public clickOnCreatedRow() {
    this.clickedOnCreateButton = true;
  }


  //making this component the parent one
  public gridOptions = {
    context: {
      componentParent: this,
      isCreatingNewRow: this.isCreatingNewRow // Pass the variable
    },
    getRowClass: params => {
      return params.data && params.data.isNew ? 'ag-temporary-row' : ''; // Apply temporary row class
    },
    getRowHeight: params => {
      return params.data.isNew ? 100 : 50; // Set 80px for temporary row, 40px for normal rows
    },

    getRowStyle: params => {
      if (params.data && params.data.isNew) {
        // return { background: '#f0f8ff' }; // Light blue background for new rows
        return { background: '#c1b3b3' };
      }
      return null; // Default style for other rows
    }

  };


  // for export in excel and csv
  getDownload(format: string) {
    const exportParams: any = {};

    if (format.toLowerCase() === 'excel') {
      // Add Excel-specific formatting options
      exportParams.fileName = 'data.xlsx'; // Optional: Customize file name
      exportParams.sheetName = 'Sheet1';   // Optional: Set sheet name
      this.gridApi.exportDataAsExcel({
        onlySelected: (
          document.querySelector("#selectedOnly") as HTMLInputElement
        ).checked,
      });
      
    } else if (format.toLowerCase() === 'csv') {
      // Add CSV-specific formatting options
      exportParams.fileName = 'data.csv'; // Optional: Customize file name
      exportParams.columnSeparator = ','; // Optional: Customize separator
      this.gridApi.exportDataAsCsv(exportParams);
    } else {
      console.error('Unsupported format:', format);
    }
    this.toasterService.showSuccess(`Downloaded in ${format} format`)
  }

  onBtPrint() {
    const gridRowData: any[] = [];
    console.log(this.gridApi)
    // Loop through each row in the grid // if you use gridApi instead of rowdata, then you would also have all updates
    this.rowData.forEach((row) => {
      const rowValues = [row.entityBusinessName, row.entityBusinessShortCode, row.createdByUser]; // Extract values manually or dynamically
      gridRowData.push(rowValues); // Push the array of values into gridRowData
    });
    generatePDF(gridRowData)
    this.toasterService.showSuccess('PDF is downloaded')
  }



  /*------------------*/
  //for the pagination

  public pageSizeOptions = [5, 10, 20, 50, 100];
  public paginationPageSize = 10;
  public paginationNumberFormatter: (
    params: PaginationNumberFormatterParams
  ) => string = function (params) {
    return '[' + params.value.toLocaleString() + ']';
  };

  onPageSizeChanged() {
    const value = (document.getElementById('page-size') as HTMLInputElement)
      .value;
    this.gridApi.paginationSetPageSize(Number(value));
  }

  /*-----------------*/

}




