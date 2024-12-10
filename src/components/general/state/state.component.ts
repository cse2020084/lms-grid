import { Component, OnInit, ViewChild } from '@angular/core';
import { ColDef,GridApi,GridReadyEvent, PaginationNumberFormatterParams } from 'ag-grid-community';
import 'ag-grid-enterprise';
import {generatePDF} from '../../../script/jspdf';
import { AgGridAngular } from 'ag-grid-angular';
import { ActionComponent } from 'src/app/component/action/action.component';
import { ClearableFloatingFilterComponent } from 'src/app/component/clearable-floating-filter/clearable-floating-filter.component';
import { SecondCustomComponent } from 'src/app/component/second-custom/second-custom.component';
import { DataService } from 'src/app/services/data.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToasterService } from 'src/app/toaster/toaster.service';
import { StateService } from 'src/components/services/state.service';
import { CustomCountryDropdownComponent } from 'src/app/component/custom-country-dropdown/custom-country-dropdown.component';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss']
})
export class StateComponent implements OnInit {
  public rowData: any[] = [];
  public countryList: any[] = [];
  public countryObjectList:any[]=[];
  public editableColumns:any[]=[];
  public gridColumnApi: any;
  public gridApi!: GridApi;          // Data to be displayed in AG Grid
  public isCheckBoxDisplaying: boolean = true; // Flag to track row creation state
  public clickedOnCreateButton:boolean=false;
  public isCreatingNewRow: boolean = false; // Flag to track row creation state
  
  constructor(
    private dataService: DataService,
    private loader:LoaderService,
    private toasterService: ToasterService,
    private stateService:StateService,
  ) { }

  ngOnInit(): void {
    
    this.editableColumns.push('entityParentBusinessName','entityBusinessShortCode','entityBusinessName')
    this.getCountry() // for getting country  list for country column

     // Emit an empty array initially
    //this.stateService.setCountries([]);

    // Simulate data load (replace this with actual API call)
    // setTimeout(() => {
     
    //   console.log('StateComponent: Setting countries to:', this.rowData);
    //   this.stateService.updateStateData(this.rowData); // Update StateService
    // }, 3000)
     
  }

  

  // Object to store warning messages for different columns
  public columnWarnings = {
    entityBusinessName: '',             // for State Name column (SecondCustom)
    entityBusinessShortCode:'' ,   // for State short code column (SecondCustom)
    entityParentBusinessName: ''               // for Country column (CustomDropdown)
  };

  // Method to update warning for a specific column
  updateColumnWarning(columnField: string, warning: string) {
    this.columnWarnings[columnField] = warning;
  }



  public columnDefs:ColDef[]=[
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
      headerName: 'Country name', field: 'entityParentBusinessName', sortable: true,
      editable: true,
      flex:1,
      cellEditor: 'customCountryDropdown', // Use our custom dropdown component
      filter: "agTextColumnFilter",
      floatingFilter: true,
      ///temporary, as i like simple better
      floatingFilterComponentParams: {
        suppressFilterButton: true, // Removes the default filter button
      },
      floatingFilterComponentFramework: ClearableFloatingFilterComponent,
      cellEditorParams:(params: any) => {
        return { options: this.countryList }; // Dynamically pass countryList
      },
      cellClassRules: {
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },
      cellRenderer: params => {
        if (params.data.isNew && !params.data.entityParentBusinessName) {
          
          const warning = this.columnWarnings.entityParentBusinessName;
          return `
          <div class="custom-cell-renderer" ;>
            <input 
              value="${params.value || ''}"
              placeholder="Choose Country"
              style="width: calc(100% - 20px); padding: 8px; font-size: 14px;}"
            />
             ${warning ? `<div class="warning-message" style="color:red ">${warning}</div>` : ''}
            
          </div>
        `;
        }
        return params.value;
      }
    },
    {
      headerName: 'State Name', field: 'entityBusinessName', sortable: true, editable: true, width: 250, 
      filter: "agTextColumnFilter",
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFilterButton: true, // Removes the default filter button
      },
      floatingFilterComponentFramework: ClearableFloatingFilterComponent,
      cellEditor: 'customTextCellEditor',
      cellEditorParams:{
        metadata:{
          parentField:['entityParentBusinessName']
        }
      },
      cellRenderer: params => {
        if (params.data.isNew) {
          const warning = this.columnWarnings.entityBusinessName;;
          return `
          <div class="custom-cell-renderer" ;>
            <input 
              value="${params.value || ''}"
              placeholder="Enter State"
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

      }
      

    },
    
    {
      headerName: 'Abbreviation', field: 'entityBusinessShortCode', sortable: true, editable: true, flex:1.2,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      ///temporary, as i like simple better
      floatingFilterComponentParams: {
        suppressFilterButton: true, // Removes the default filter button
      },
      floatingFilterComponentFramework: ClearableFloatingFilterComponent,
      cellEditor: 'customTextCellEditor',
      cellEditorParams:{
        metadata:{
          parentField:['entityParentBusinessName']
        }
      },
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
      headerName: 'Last Updated By', field: 'createdByUser', flex:1,sortable: true,
      cellClassRules: {
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },
    },
    {
      headerName: 'Last Modified on', field: 'effectiveDateFrom', flex:1, filter: "agDateColumnFilter", sortable: true, cellClassRules: {
        'deactivated-row': (params) =>
          params.data.activeFlag !== 1
      },
    },

    {
      headerName: 'Status',
      sortable: true,
      cellRenderer: 'actionCellRenderer', // Uses custom cell renderer for actions
      flex:1.2,
      cellRendererParams: {
        activateRow: this.activateRow.bind(this),
        deactivateRow: this.deactivateRow.bind(this)
      }

    }
  ]

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
    customTextCellEditor: SecondCustomComponent,
    customCountryDropdown:CustomCountryDropdownComponent,
  };


  loadState(auditflag:boolean){

    const payload = {
      genericRequestEntity: {
        companyID: 1,
        createdBy: 1,
        mode: 'W',
        detailFlag: auditflag,
        dropDown: false

      }
    };

    this.loader.showSpinner('Loading data...');
    this.dataService.retrieveData('stateservice/getAllState/', payload)
      .subscribe(
        (records: any) => {

          // Check if the API call was successful
          if (records.statusCode === "200" || records.statusCode === "300") {
            // Update rowData with the data received from the server
            this.rowData = records.responseList || [];

            // Ensure data is populated before updating
        if (records.responseList && records.responseList.length > 0) {
          this.stateService.updateStateData(records.responseList);
          
          // Optional: Debugging method
          this.stateService.debugCurrentValue();
        }
           // this.stateService.updateStateData(records.responseList|| []);
            this.gridApi.setRowData(this.rowData); // Update the grid with new data

             // Extract unique country names from the grid's row data
    

    // Update the StateService with the list of countries
    
    //this.stateService.setCountries(this.rowData);
            console.log(this.rowData)
            
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
    // (document.getElementById("selectedOnly") as HTMLInputElement).checked =
    //   true;


    // Load data into grid once it's fully initialized
    // this.getCountry()
    this.loadState(false); // Assuming loadData is asynchronous
    
    //this.stateService.setRowData(this.rowData);
    


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
        return { background: '#1AFF0019' };
      }
      return null; // Default style for other rows
    },
    suppressRowClickSelection: true,
    components: {
      customTextCellEditor: SecondCustomComponent
    }
    
    

  };


   /**
   * Adds a new row to the top of the grid.
   */
   addNewRow() {
    this.clickedOnCreateButton = true; // // to disable create button 
    this.isCheckBoxDisplaying=false; // to disable checkbox
    const newItem = {
      entityParentBusinessName:'',
      entityBusinessName: '',
      entityBusinessShortCode: '',
      isNew: true,
      activeFlag: 1,
      rowClass: 'ag-temporary-row', // Apply a custom class for styling
      forceEdit: true, // Add a custom flag to force editing behavior
      
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


    if (!item.entityParentBusinessName  || !item.entityBusinessName || !item.entityBusinessShortCode) {
      console.log(item)
      console.error('Error saving row: Mandatory Field is NULL');
      return;
    }


    

    
    // Find the corresponding entityParentBusinessID
  const selectedCountry = this.countryObjectList.find(country => 
    country.entityBusinessName === item.entityParentBusinessName
  );
  console.log('selectedcountry',selectedCountry.entityBusinessID)

    const payload = {
      genericManipulationRequestEntity: {
        companyID: 1,
        createdBy: 1,
        entityBusinessName: item.entityBusinessName,
        entityBusinessShortCode: item.entityBusinessShortCode,
        entityParentBusinessID: selectedCountry.entityBusinessID,
        auditAction: 'C',
        mode: 'W'
      }
    }
    console.log("item to be sent:", item);
    console.log('gridoptions',this.gridOptions)

    // if (this.checkForDuplicates(item.entityBusinessName, item.entityBusinessShortCode)) {
    //   alert('Duplicate country name or code found. Please enter unique values.');
    //   return;
    // }



    this.dataService.saveRowData(item, 'stateservice/createChildEntity/', payload).then(
      (result) => {
        item.isNew = false; // Mark row as saved
        console.log('Row saved successfully');
        this.isCreatingNewRow = false; // Reset the new row creation flag
        this.clickedOnCreateButton = false; // to enable create button again
        this.isCheckBoxDisplaying=true;
        this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
        this.toasterService.showSuccess('Data saved successfully');
        this.loadState(false);
      },
      error => {
        console.error('Error saving row:', error);
        this.toasterService.showError(`Not saved-${error}`)
      }
    ).catch((errorMessage) => {
      console.log('error ..')
      this.toasterService.showError('Not saved')
    });

    // this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
    // this.loadData();
   // this.cdr.markForCheck();  // Manually trigger change detection
    // this.clickedOnCreateButton = false; // to enable create button again
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
    
    console.log(this.columnDefs, index)
    // if (index > -1) {
    this.rowData.splice(0, 1);

    this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData

    // }

    //this.loadData(); // less efficient approach
    this.isCreatingNewRow = false; // Reset the new row creation flag
    // this.duplicateError = false; // Reset the duplicate error flag
    // this.duplicateMessage = ''; // Clear duplicate message
    this.clickedOnCreateButton = false; // to enable create button again
    this.isCheckBoxDisplaying=true;
    item.isNew = false; // Mark row as cancelled
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
          entityParentBusinessID: item.entityParentBusinessID,
          auditAction: 'U',
          companyID: 1,
          createdBy: 1,
          mode: 'W'
        }
      }

      console.log('item',item)
      this.loader.showSpinner('Data is being Updated');
      this.dataService.saveRowData(item, 'stateservice/updateChildEntity/', updatedRow).then(
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



    editDropDown(item) {
       console.log('item', item)
  
      // if (this.existingName === item.entityBusinessName && this.existingShortCode === item.entityBusinessShortCode) {
      //   this.toasterService.showError('Unchanged Data')
      //   //alert('Value is unchanged')
      //   return
      // }
       // Find the corresponding entityParentBusinessID
  const selectedCountry = this.countryObjectList.find(country => 
    country.entityBusinessName === item.entityParentBusinessName
  );

      const updatedRow = {
        genericManipulationRequestEntity:
        {
          entityID: item.entityID,
          entityBusinessID: item.entityBusinessID,
          entityBusinessName: item.entityBusinessName,
          entityBusinessShortCode: item.entityBusinessShortCode,
          entityParentBusinessID: selectedCountry.entityBusinessID,
          auditAction: 'U',
          companyID: 1,
          createdBy: 1,
          mode: 'W'
        }
      }

      console.log('item',item)
      this.loader.showSpinner('Data is being Updated');
      this.dataService.saveRowData(item, 'stateservice/updateChildEntity/', updatedRow).then(
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
        entityParentBusinessID: item.entityParentBusinessID,
        auditAction: 'A',
        companyID: 1, //auth.service
        createdBy: 1, //auth.service
        mode: 'W'
      }
    }
    this.loader.showSpinner('Data is being Activated')
    console.log('item',item)
    this.dataService.saveRowData(item, 'stateservice/activateChildEntity', payload).then(
      (result: any) => {
        console.log('activated successfully', result)
        if (result && result.entityID) item.entityID = result.entityID
        //item.activeFlag = 1;
        // this.gridApi.refreshCells({ rowNodes: [item], force: true });
        // Dynamically update the row data
        item.activeFlag = 1; // Update the activeFlag or other necessary fields
        this.gridApi.applyTransaction({ update: [item] }); // Dynamically update the row
       // this.cdr.detectChanges(); // Ensure Angular detects the changes
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
        entityParentBusinessID: item.entityParentBusinessID,
        auditAction: 'D',
        companyID: 1, //auth.service
        createdBy: 1, //auth.service
        mode: 'W'
      }
    }
    this.loader.showSpinner('Data is being Deactivated')
    console.log('item',item)
    this.dataService.saveRowData(item, 'stateservice/deactivateChildEntity', payload).then(
      (result: any) => {
        console.log('deactivated successfully', result)
        if (result && result.entityID) item.entityID = result.entityID
        //item.activeFlag = 0;
        // Dynamically update the row data
        item.activeFlag = 0; // Update the activeFlag or other necessary fields
        this.gridApi.applyTransaction({ update: [item] }); // Dynamically update the row
        //this.gridApi.refreshCells({ rowNodes: [item], force: true });
        //this.cdr.detectChanges(); // Ensure Angular detects the changes
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

  
  getCountry() {

    
    const payload = {
      genericRequestEntity: {
        companyID: 1,
        createdBy: 1,
        mode: 'W',
        detailFlag: false,
        dropDown: false

      }
    };
    //this.loader.showSpinner('Loading data...');
    this.dataService.retrieveData('countryservice/getAllCountry', payload)
      .subscribe(
        (records: any) => {

          // Check if the API call was successful
          if (records.statusCode === "200" || records.statusCode === "300") {
            // Update rowData with the data received from the server
            ///this.countryList = records.responseList || [];
            ///greyed  below 1 line
            console.log('getcountry-record',records)
            // this.countryList = records.responseList
            // .filter((item: any) => item.activeFlag)
            // .map((item: any) => {
            //   console.log('map-item',item)
            //    item.entityBusinessName
            // });

            records.responseList.forEach((items)=>{
              if(items.activeFlag===1){
                this.countryList.push(items.entityBusinessName)
              }
            })

            console.log('country-list',this.countryList)
            // Update countryObjectList with both ID and Name
            this.countryObjectList = records.responseList.map((item: any) => ({
              entityBusinessName: item.entityBusinessName,
              entityBusinessID: item.entityBusinessID
            }));


            console.log(this.countryObjectList)
          } else {
            console.error('Error:', records.errorMessage);
            this.toasterService.showError('Failed to load data');
          }
          //this.loader.hideSpinner();
        },
        error => {
         // this.loader.hideSpinner();
          this.toasterService.showError('Network error occurred');
          console.error('Network or server issue:', error);
        }
      );

  }



  /*------------------*/
  //for the download


  // for export in excel and csv
  getDownload(format: string) {
    const exportParams: any = {};

    if (format.toLowerCase() === 'excel') {
      // Add Excel-specific formatting options
      exportParams.fileName = 'stateList.xlsx'; // Optional: Customize file name
      exportParams.sheetName = 'Sheet1';   // Optional: Set sheet name
      this.gridApi.exportDataAsExcel({
        onlySelected: (
          document.querySelector("#selectedOnly") as HTMLInputElement
        ).checked,
      });
      
    } else if (format.toLowerCase() === 'csv') {
      // Add CSV-specific formatting options
      exportParams.fileName = 'stateList.csv'; // Optional: Customize file name
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
