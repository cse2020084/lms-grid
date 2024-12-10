import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ColDef, GridApi, PaginationNumberFormatterParams, RowClassRules } from 'ag-grid-community';
import { ActionComponent } from 'src/app/component/action/action.component';
import { DataService } from 'src/app/services/data.service';
import { SecondCustomComponent } from 'src/app/component/second-custom/second-custom.component';
import { ClearableFloatingFilterComponent } from 'src/app/component/clearable-floating-filter/clearable-floating-filter.component';
import {generatePDF} from '../../../script/jspdf';
import 'ag-grid-enterprise';
//import { generatePDF } from '../script/jspdf'
import { LoaderService } from 'src/app/services/loader.service';
import { ToasterService } from 'src/app/toaster/toaster.service';
import { StateService } from 'src/components/services/state.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';




@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // Adding Change Detection Strategy
})
export class CountryComponent implements OnInit {

  public stateCountries: any[] = [];
  public currentColumnDefs: ColDef[];
  public countryList$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  countryListSubscription: Subscription;
  constructor(
    private dataService: DataService,
    // private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private loader:LoaderService,
    private toasterService: ToasterService,
    private stateService:StateService,
    private route: ActivatedRoute,
  ) {
     
   }




  loading$ = this.loader.loading$;
  public rowData: any[] = [];          // Data to be displayed in AG Grid
  public gridApi!: GridApi;
  public gridColumnApi: any;
  public isCreatingNewRow: boolean = false; // Flag to track row creation state
  public isCheckBoxDisplaying: boolean = true; // Flag to track row creation state
  public duplicateError: boolean = false; // Flag to track if a duplicate is found

  public duplicateMessage: string = ''; // Message for duplicate warning ,borderBottom: '2px solid #ccc'
  public clickedOnCreateButton: boolean = false; //for disabling other button
  public eventDataWarning = false;

  public isActive: boolean = true;
  public editableColumns:any[]=[]; // for removing wrng msg on cancellation
  public logView:boolean=false;


  // Object to store warning messages for different columns
  public columnWarnings = {
    entityBusinessName: '',             // for State Name column (SecondCustom)
    entityBusinessShortCode:'' ,   // for State short code column (SecondCustom)
   
  };

  // Method to update warning for a specific column
  updateColumnWarning(columnField: string, warning: string) {
    this.columnWarnings[columnField] = warning;
  }




  public columnDefs: ColDef[] = [
    {
      field:'',
      checkboxSelection: (params) => {
        return this.isCheckBoxDisplaying;
      },
       headerCheckboxSelection: true,
      width:50,
      cellClassRules: {
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },
    },
    {
      headerName: 'Country Name', field: 'entityBusinessName', sortable: true, editable: true, width: 250, 
      filter: "agTextColumnFilter",
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFilterButton: true, // Removes the default filter button
      },
      floatingFilterComponentFramework: ClearableFloatingFilterComponent,
      cellEditor: 'customTextCellEditor',
      cellRenderer: params => {
        if (params.data.isNew) {
          const warning = this.columnWarnings.entityBusinessName;;
          return `
          <div class="custom-cell-renderer" ;>
            <input 
              value="${params.value || ''}"
              placeholder="Enter Country"
              style="width: calc(100% - 20px); padding: 8px; font-size: 14px;}"
            />
             ${warning ? `<div class="warning-message" style="color: red;">${warning}</div>` : ''}
          </div>
        `;
        }
        return params.value;
      },
      cellClassRules: {

        'deactivated-row': (params) => params.data.activeFlag !== 1

      },
      

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
      cellEditor: 'customTextCellEditor',
      cellRenderer: params => {
        if (params.data.isNew) {
          const warning = this.columnWarnings.entityBusinessShortCode;
          return `
          <div class="custom-cell-renderer" ;>
            <input 
              value="${params.value || ''}"
              placeholder="Enter Abbreviation"
              style="width: calc(100% - 20px); padding: 8px; font-size: 14px;}"
            />
             ${warning ? `<div class="warning-message" style="color: red;">${warning}</div>` : ''}
          </div>
        `;
        }
        return params.value;
      },
      
      
      cellClassRules: {
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },


    },
    {
      headerName: 'Last Updated By', field: 'createdByUser', width: 230,sortable: true,
      cellClassRules: {
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },
    },
    {
      headerName: 'Last Modified on', field: 'effectiveDateFrom', width: 320, filter: "agDateColumnFilter", sortable: true, cellClassRules: {
        'deactivated-row': (params) =>
          params.data.activeFlag !== 1
      },
    },

    {
      headerName: 'Status',
      sortable: true,
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
    columnDefs:this.columnDefs

  };
  // Register framework components, such as custom cell renderers
  public frameworkComponents = {
    actionCellRenderer: ActionComponent,
    // customTextCellEditor: CustomTextCellEditor
    customTextCellEditor: SecondCustomComponent
  };


  


private sub:Subscription
  ngOnInit() {
    //this.loadData()
    this.editableColumns.push('entityBusinessShortCode','entityBusinessName');
    this.currentColumnDefs = this.columnDefs
 
    // this.loadData().then((records: any) => {
    //   this.countryList$.next(records);
    // }).catch(error => {
    //   this.countryList$.next([]);
    // });

    // // Access resolved data
    // this.stateCountries = this.route.snapshot.data['countries'];
    // console.log('CountryComponent: Resolved countries:', this.stateCountries);

    // Additionally, log for debugging purposes
    // if (!this.stateCountries || this.stateCountries.length === 0) {
    //   console.log('CountryComponent: No countries were resolved. Waiting for updates...');
    // };
  
    console.log(this.stateService.countriesSubject.getValue())

    
      this.stateService.countries$.subscribe((countries) => {
        console.log('Reactive countries:', countries);
        this.stateCountries = countries;
      });
     // 4000ms delay
    
    console.log('sub',this.sub)
    // Check if data is already available
    const existingData = this.stateService.getCurrentStateData();
    if (existingData) {
      this.stateCountries = existingData;
      console.log('existing countries:', existingData);
    }
  
    // const countries = this.state.getCountries();
    // console.log('Synchronous countries:', countries);
    // this.stateCountries = countries;
  

    

  }

  ngOnDestroy() {
    if (this.countryListSubscription) {
      this.countryListSubscription.unsubscribe();
    }
  }

  /***********/
  //showlog


  public logDefs:ColDef[]=[
    {headerName: 'Country Name', field: 'entityBusinessName'},
    {headerName: 'Abbreviation', field: 'entityBusinessShortCode'},
    {headerName: 'Last Updated By', field: 'createdByUser',flex:1.5,},
    {headerName: 'Last Modified on', field: 'effectiveDateFrom',},
    {headerName: 'Audit Action', field: 'auditAction',}
  ];

  toggleColumnDefs(){
    if (this.currentColumnDefs === this.columnDefs) {
      this.currentColumnDefs = this.logDefs;
      this.logView=true;
    } else {
      
      this.currentColumnDefs = this.columnDefs;
      this.logView=false;
      
    }

    
    // Optional: If you want to force grid to refresh
    if (this.gridApi) {
      this.gridApi.setColumnDefs(this.currentColumnDefs);
      

      
    }
   
  }

 

  showLog(toggleFlag) {
    this.toggleColumnDefs();
    this.countryList$.next([]);
    console.log('countryList', this.countryList$);

    if (toggleFlag) {
        this.loadData(true)
            .then((records: any) => {
                this.countryList$.next(records);
                console.log('countryList', this.countryList$);
            })
            .catch(error => {
                this.countryList$.next([]);
                console.log('error', error);
            });
    }else{
      this.countryList$.next([]);
      this.loadData(false)
    }
  
}



  /*******END*******/

  


    /****  new load data */ 


    loadData(auditFlag:boolean) {
      return new Promise((resolve, reject) => {
          const payload = {
              genericRequestEntity: {
                  companyID: 1,
                  createdBy: 1,
                  mode: 'W',
                  detailFlag: auditFlag,
                  dropDown: false
              }
          };
          this.loader.showSpinner('Loading data...');
          this.countryListSubscription = this.dataService.retrieveData('countryservice/getAllCountry', payload)
              .subscribe(
                  (records: any) => {
                      this.loader.hideSpinner();
                      if (records.statusCode === "200" || records.statusCode === "300") {
                          this.rowData = records.responseList || [];
                          this.gridApi.setRowData(this.rowData);
                          this.toasterService.showSuccess('Data loaded successfully');
                          resolve(records.responseList); // Resolve with the actual data
                      } else {
                          console.error('Error:', records.errorMessage);
                          this.toasterService.showError('Failed to load data');
                          reject(records.errorMessage); // Reject with error message
                      }
                  },
                  error => {
                      this.loader.hideSpinner();
                      this.toasterService.showError('Network error occurred');
                      console.error('Network or server issue:', error);
                      reject(error); // Reject with the error
                  }
              );
      });
  }
    /**8 */

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

    this.loadData(false); // Assuming loadData is asynchronous


  }






  /**
   * Adds a new row to the top of the grid.
   */
  addNewRow() {
    this.clickedOnCreateButton = true; // // to disable create button 
    this.isCheckBoxDisplaying=false; // to disable checkbox
    const newItem = {
      entityBusinessName: '',
      entityBusinessShortCode: '',
      isNew: true,
      activeFlag: 1,
      rowClass: 'ag-temporary-row', // Apply a custom class for styling
      forceEdit: true // Add a custom flag to force editing behavior
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
        this.isCheckBoxDisplaying=true;
        this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
        this.toasterService.showSuccess('Data saved successfully');
        this.loadData(false);
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
    this.isCheckBoxDisplaying=true;
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
    this.isCheckBoxDisplaying=true;
    this.toasterService.showSuccess('Not added')

    this.editableColumns.forEach(country=>{
      this.updateColumnWarning(country,'');
     })
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
    
    const countries = this.stateCountries;
    
    // if (this.stateCountries.includes(item.entityBusinessName)) {
    //   this.toasterService.showError(
    //     `${item.entityBusinessName} is already present in the State table and cannot be deactivated.`
    //   );
    //   return;
    // }

    console.log(`Deactivating country:`,countries);
  

      
      
    
    
      
    

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
      if(this.logView){
        return  40
      }
      return params.data.isNew ? 100 : 50; // Set 80px for temporary row, 40px for normal rows
    },

    getRowStyle: params => {
       // Check if logView is true
    if (this.logView) {
      // Apply different background color for odd rows
      if (params.node.rowIndex % 2 !== 0) {
        return { background: '#f0f0f0' }; // Example: Light gray for odd rows
      }
      return {}; // Default background for even rows
    }
      if (params.data && params.data.isNew) {
        // return { background: '#f0f8ff' }; // Light blue background for new rows
        //return { background: '#c1b3b3' };

        return {background: '#1AFF0019'}
      }
      return null; // Default style for other rows
    },
    suppressRowClickSelection: true,
    
    

  };


  // for export in excel and csv
  getDownload(format: string) {
    const exportParams: any = {};

    if (format.toLowerCase() === 'excel') {
      // Add Excel-specific formatting options
      exportParams.fileName = 'CountryList.xlsx'; // Optional: Customize file name
      exportParams.sheetName = 'Sheet1';   // Optional: Set sheet name
      this.gridApi.exportDataAsExcel({
        onlySelected: (
          document.querySelector("#selectedOnly") as HTMLInputElement
        ).checked,
      });
      
    } else if (format.toLowerCase() === 'csv') {
      // Add CSV-specific formatting options
      exportParams.fileName = 'CountryList.csv'; // Optional: Customize file name
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





