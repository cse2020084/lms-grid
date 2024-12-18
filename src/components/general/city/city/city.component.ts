import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ColDef, GridApi, PaginationNumberFormatterParams, RowClassRules } from 'ag-grid-community';
import { ActionComponent } from 'src/app/component/action/action.component';
import { DataService } from 'src/app/services/data.service';
import { SecondCustomComponent } from 'src/app/component/second-custom/second-custom.component';
import { ClearableFloatingFilterComponent } from 'src/app/component/clearable-floating-filter/clearable-floating-filter.component';
//import {generatePDF} from '../../../script/jspdf';
import 'ag-grid-enterprise';

import {generatePDF} from '../../../../script/jspdf';
import { LoaderService } from 'src/app/services/loader.service';
import { ToasterService } from 'src/app/toaster/toaster.service';
import { StateService } from 'src/components/services/state.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CustomCountryDropdownComponent } from 'src/app/component/custom-country-dropdown/custom-country-dropdown.component';


interface CustomColDef extends ColDef {
  // Define your custom properties here
  selectionList?:any,
  isParent?:boolean
}




@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
  //changeDetection: ChangeDetectionStrategy.OnPush // Adding Change Detection Strategy
})
export class CityComponent implements OnInit {
  public stateCountries: any[] = [];
  public currentColumnDefs: ColDef[];
  public cityList$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
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
  public countryList: any[] = [];
  public countryObjectList:any[]=[];
  public stateObjectList:any[]=[];
  public stateList: any[] = [];
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
    entitySuperParentBusinessName:'',
    entityParentBusinessName:'',
    entityBusinessName: '',             // for State Name column (SecondCustom)
    entityBusinessShortCode:'' ,   // for State short code column (SecondCustom)
   
  };

  // Method to update warning for a specific column
  updateColumnWarning(columnField: string, warning: string) {
    this.columnWarnings[columnField] = warning;
  }


  ngOnInit() {
    //this.loadData()
    this.getCountry(false);
    //this.getState(false);
    
    this.editableColumns.push('entitySuperParentBusinessName','entityParentBusinessName','entityBusinessShortCode','entityBusinessName');
    this.currentColumnDefs = this.columnDefs
 
    this.stateService.stateData$.subscribe((data) => {
      this.stateCountries = data;
      console.log('Updated rowData in Component B:', this.rowData);
    });

  }



  public columnDefs:CustomColDef[]=[
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
      headerName: 'Country name', field: 'entitySuperParentBusinessName', sortable: true,
      editable: true,
      width: 250,
      cellEditor: 'customCountryDropdown', // Use our custom dropdown component
      filter: "agTextColumnFilter",
      floatingFilter: true,
      ///temporary, as i like simple better
      floatingFilterComponentParams: {
        suppressFilterButton: true, // Removes the default filter button
      },
      floatingFilterComponentFramework: ClearableFloatingFilterComponent,
      selectionList: { data: [], key: 'entityBusinessID', value: 'entityBusinessName' },
      isParent:true,
      cellEditorParams:(params: any) => {
        return { 
          options: this.countryList,

         }; // Dynamically pass countryList
      },
      cellClassRules: {
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },
      cellRenderer: params => {
        if (params.data.isNew && !params.data.entitySuperParentBusinessName) {
          
          const warning = this.columnWarnings.entitySuperParentBusinessName;
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
      headerName: 'State Name', field: 'entityParentBusinessName', sortable: true, editable: true,
      width: 250, 
      filter: "agTextColumnFilter",
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFilterButton: true, // Removes the default filter button
      },
      floatingFilterComponentFramework: ClearableFloatingFilterComponent,
      cellEditor: 'customCountryDropdown', // Use our custom dropdown component',
      cellEditorParams:{
        metadata:{
          parentField:['entitySuperParentBusinessName'],
        },
        options:(params)=>{
          console.log('params in city',params)
          return this.fetchState(params.data.entitySuperParentBusinessName);
          // this.getState(params.data.entitySuperParentBusinessName,false)
        } ,
        parent:'entitySuperParentBusinessName',
      },
      cellRenderer: params => {
        if (params.data.isNew && !params.data.entityParentBusinessName) {
          const warning =this.columnWarnings.entityParentBusinessName;
         
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
      headerName: 'City Name', field: 'entityBusinessName', sortable: true, editable: true, 
      width: 250, 
      filter: "agTextColumnFilter",
      floatingFilter: true,
      floatingFilterComponentParams: {
        suppressFilterButton: true, // Removes the default filter button
      },
      floatingFilterComponentFramework: ClearableFloatingFilterComponent,
      cellEditor: 'customTextCellEditor',
      cellEditorParams:{
        metadata:{
          parentField:['entitySuperParentBusinessName','entityParentBusinessName']
        }
      },
      cellRenderer: params => {
        if (params.data.isNew) {
          const warning =this.columnWarnings.entityBusinessName;
         
          return `
          <div class="custom-cell-renderer" ;>
            <input 
              value="${params.value || ''}"
              placeholder="Enter City"
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
      headerName: 'Abbreviation', field: 'entityBusinessShortCode', sortable: true, editable: true,
      // flex:1.2,
      width:200,
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
      headerName: 'Last Updated By', field: 'createdByUser', 
      //flex:1,
      width:200,
      sortable: true,
      cellClassRules: {
        'deactivated-row': (params) => params.data.activeFlag !== 1
      },
    },
    {
      headerName: 'Last Modified on', field: 'effectiveDateFrom',
       //flex:1,
       width:200,
        filter: "agDateColumnFilter", sortable: true, cellClassRules: {
        'deactivated-row': (params) =>
          params.data.activeFlag !== 1
      },
    },

    {
      headerName: 'Status',
      sortable: true,
      cellRenderer: 'actionCellRenderer', // Uses custom cell renderer for actions
      //flex:1.2,
      width:200,
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
    columnDefs:this.columnDefs,
    width: 150,

  };
  // Register framework components, such as custom cell renderers
  public frameworkComponents = {
    actionCellRenderer: ActionComponent,
    // customTextCellEditor: CustomTextCellEditor
    customCountryDropdown:CustomCountryDropdownComponent,
    customTextCellEditor: SecondCustomComponent
  };


  


private sub:Subscription
  

  // ngOnDestroy() {
  //   if (this.countryListSubscription) {
  //     this.countryListSubscription.unsubscribe();
  //   }
  // }

  /***********/
  //showlog


  public logDefs:ColDef[]=[
    {headerName: 'Country Name', field: 'entitySuperParentBusinessName'},
    {headerName: 'State Name', field: 'entityParentBusinessName'},
    {headerName: 'City Name', field: 'entityBusinessName'},
    {headerName: 'Abbreviation', field: 'entityBusinessShortCode'},
    {headerName: 'Last Updated By', field: 'createdByUser'},
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
      
      this.gridApi.sizeColumnsToFit();
      
    }
    
   
  }

 

  showLog(toggleFlag) {
    this.toggleColumnDefs();
    this.cityList$.next([]);
    console.log('countryList', this.cityList$);

    if (toggleFlag) {
        this.loadCity(true)
            .then((records: any) => {
                this.cityList$.next(records);
                console.log('countryList', this.cityList$);
            })
            .catch(error => {
                this.cityList$.next([]);
                console.log('error', error);
            });
    }else{
      this.cityList$.next([]);
      this.loadCity(false)
    }
  
}



  /*******END*******/

  


    /****  new load data */ 


    loadCity(auditFlag:boolean) {
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
          this.countryListSubscription = this.dataService.retrieveData('cityservice/getAllCity/', payload)
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
    

    this.loadCity(false); // Assuming loadData is asynchronous

    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }


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
      entityParentBusinessName:'',
      entitySuperParentBusinessName:'',
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

    if (!item.entitySuperParentBusinessName  || !item.entityParentBusinessName  || !item.entityBusinessName || !item.entityBusinessShortCode) {
      console.error('Error saving row: Mandatory Field is NULL');
      return;
    }
    try {

      const highlightedCountry = this.stateObjectList.find(country => 
        country.entityParentBusinessName === item.entitySuperParentBusinessName
       );
       const selectedCountry=this.countryObjectList.find(country=>
         country.entityBusinessName===highlightedCountry.entityParentBusinessName
       )
       
       
       const selectedState = this.stateObjectList.find(country => 
         country.entityBusinessName === item.entityParentBusinessName
        );
  
      const payload = {
        genericChildManipulationRequestEntity: {
          companyID: 1,
          createdBy: 1,
          entityBusinessName: item.entityBusinessName,
          entityBusinessShortCode: item.entityBusinessShortCode,
          entityParentBusinessID: selectedState.entityBusinessID,
          entitySuperParentBusinessID: selectedCountry.entityBusinessID,
          auditAction: 'C',
          mode: 'W'
        }
      }
      console.log("item to be sent:", item);
  
      // if (this.checkForDuplicates(item.entityBusinessName, item.entityBusinessShortCode)) {
      //   alert('Duplicate country name or code found. Please enter unique values.');
      //   return;
      // }
  
  
  this.loader.showSpinner('Data is being Saved');
      this.dataService.saveRowData(item, 'cityservice/createSuperChildEntity/', payload).then(
        (result) => {
          item.isNew = false; // Mark row as saved
          console.log('Row saved successfully');
          this.isCreatingNewRow = false; // Reset the new row creation flag
          this.isCheckBoxDisplaying=true;
          this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
          this.loader.hideSpinner();
          this.toasterService.showSuccess('Data saved successfully');
          this.loadCity(false);
        },
        error => {
          console.error('Error saving row:', error);
          this.loader.hideSpinner();
          this.toasterService.showError('Not saved')
        } 
      ).catch((errorMessage) => {
        console.log('error ..')
        this.loader.hideSpinner()
        this.toasterService.showError('Not saved')
      });
      
  
      // this.gridApi.setRowData(this.rowData); // Refresh the grid with updated rowData
      // this.loadData();
      this.cdr.markForCheck();  // Manually trigger change detection
      this.clickedOnCreateButton = false; // to enable create button again
      // this.gridApi.refreshCells({
  
      //   force: true,
      // });
      
    } catch (error) {
      this.loader.hideSpinner()
      this.toasterService.showError(error)
    }


    
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
    const payload = {
      genericChildManipulationRequestEntity: {
        entityID: item.entityID,
        entityBusinessID: item.entityBusinessID,
        entityBusinessName: item.entityBusinessName,
        entityBusinessShortCode: item.entityBusinessShortCode,
        entityParentBusinessID: item.entityParentBusinessID,
        entitySuperParentBusinessID: item.entitySuperParentBusinessID,
        auditAction: 'U',
        companyID: 1,
        createdBy: 1,
        mode: 'W'
      }
    }
    this.loader.showSpinner('Data is being Updated');
    this.dataService.saveRowData(item, 'cityservice/updateSuperChildEntity/', payload).then(
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
   

   // if (this.existingName === item.entityBusinessName && this.existingShortCode === item.entityBusinessShortCode) {
   //   this.toasterService.showError('Unchanged Data')
   //   //alert('Value is unchanged')
   //   return
   // }
    // Find the corresponding entityParentBusinessID

    try {
      const highlightedCountry = this.stateObjectList.find(country => 
        country.entityParentBusinessName === item.entitySuperParentBusinessName
       );
       const selectedCountry=this.countryObjectList.find(country=>
         country.entityBusinessName===highlightedCountry.entityParentBusinessName
       )
       
       
       const selectedState = this.stateObjectList.find(country => 
         country.entityBusinessName === item.entityParentBusinessName
        );


        const payload = {
          genericChildManipulationRequestEntity: {
            entityID: item.entityID,
            entityBusinessID: item.entityBusinessID,
            entityBusinessName: item.entityBusinessName,
            entityBusinessShortCode: item.entityBusinessShortCode,
            entityParentBusinessID: selectedState.entityBusinessID,
            entitySuperParentBusinessID: selectedCountry.entityBusinessID,
            auditAction: 'U',
            companyID: 1,
            createdBy: 1,
            mode: 'W'
          }
        }
        
        console.log('item',item)
        this.loader.showSpinner('Data is being Updated');
        this.dataService.saveRowData(item, 'cityservice/updateSuperChildEntity/', payload).then(
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
      
    } catch (error) {
      this.toasterService.showError(error)
    }



 }


  activateRow(item) {

    const payload = {
      genericChildManipulationRequestEntity: {
        entityID: item.entityID,
        entityBusinessID: item.entityBusinessID,
        entityBusinessName: item.entityBusinessName,
        entityBusinessShortCode: item.entityBusinessShortCode,
        entityParentBusinessID: item.entityParentBusinessID,
        entitySuperParentBusinessID: item.entitySuperParentBusinessID,
        auditAction: 'A',
        companyID: 1, //auth.service
        createdBy: 1, //auth.service
        mode: 'W'
      }
    }
    this.loader.showSpinner('Data is being Activated')
    this.dataService.saveRowData(item, 'cityservice/activateSuperChildEntity', payload).then(
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
      genericChildManipulationRequestEntity: {
        entityID: item.entityID,
        entityBusinessID: item.entityBusinessID,
        entityBusinessName: item.entityBusinessName,
        entityBusinessShortCode: item.entityBusinessShortCode,
        entityParentBusinessID: item.entityParentBusinessID,
        entitySuperParentBusinessID: item.entitySuperParentBusinessID,
        auditAction: 'D',
        companyID: 1, //auth.service
        createdBy: 1, //auth.service
        mode: 'W'
      }
    }
    this.loader.showSpinner('Data is being Deactivated')
    console.log('item',item)
    this.dataService.saveRowData(item, 'cityservice/deactivateSuperChildEntity', payload).then(
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


  updateRowData(rowData: any): void {
    const rowNode = this.gridApi.getRowNode(rowData.id); // Use the ID or unique identifier
    if (rowNode) {
      this.gridApi.applyTransaction({ update: [rowData] }); // Update the grid row data
    }
  }



  public clickOnCreatedRow() {
    this.clickedOnCreateButton = true;
  }


  getCountry(detailFlag = false) {
    return new Promise((resolve, reject) => {
      
      const payload = {
        genericRequestEntity: {
          companyID: 1,
          createdBy: 1,
         // entityBusinessID: null,
          mode: 'W',
          detailFlag:detailFlag,
          dropDown: false
        }
      }
      this.dataService.retrieveData('countryservice/getAllCountry',payload).subscribe((records: any) => {
        
        if (records.statusCode === "200" || records.statusCode === "300") {
          //records.responseList = records.responseList == null ? [] : records.responseList;  // records.responseList.entityBusinessID,
          records.responseList.forEach((items)=>{
            if(items.activeFlag===1){
              // this.countryList.push(items.entityBusinessName)
              
              // this.countryObjectList = records.responseList.map((item: any) => ({
              //   entityBusinessName: item.entityBusinessName,
              //   entityBusinessID: item.entityBusinessID
              // }));
            }
          })
          this.getState(records.responseList.entityBusinessID,false)
          console.log('country list',this.countryList, records, )
          resolve(records.responseList);
        } else {
          reject(records.errorMessage);
          console.log(' no country list',this.countryList,records)
        }
      }, (error) => {
        this.loader.hideSpinner();
        reject('Either Internet is not working or facing internal server issue')
      })
    })
  }

  getState(countryID, detailFlag = false) {
    return new Promise((resolve, reject) => {
     
      const payload = {
        genericRequestEntity: {
          companyID: 1,
          createdBy: 1,
          entityBusinessID: countryID,
          mode: 'W',
          detailFlag,
          dropDown: false,
        }
      }
       this.dataService.retrieveData( 'stateservice/getAllState/',payload).subscribe((records: any) => {
       
        if (records.statusCode === "200" || records.statusCode === "300") {
          records.responseList = records.responseList == null ? [] : records.responseList;
          records.responseList.forEach((items)=>{
            console.log('ActivedFlag', items.activeFlag )
            if(items.activeFlag===1){
             // this.stateList.push(items.entityBusinessName)
             
              this.stateObjectList = records.responseList
              .filter((item: any) => item.activeFlag === 1)
              .map((item: any) => ({
                entityBusinessName: item.entityBusinessName,
                entityBusinessID: item.entityBusinessID,
                entityParentBusinessName: item.entityParentBusinessName,
                entityParentBusinessId: item.entityParentBusinessId,
                
              }));


              this.countryList.push(items.entityParentBusinessName)
              
              this.countryObjectList = records.responseList.map((item: any) => ({
                entityBusinessName: item.entityParentBusinessName,
                entityBusinessID: item.entityParentBusinessID
              }));

            }
            console.log('activeFlag', items.activeFlag )
          })
          console.log('state list',this.stateObjectList)
          resolve(records.responseList);
        } else {
          reject(records.errorMessage);
        }
      }, (error) => {
        
        reject('Either Internet is not working or facing internal server issue')
      })
    })
  }


  fetchState(parentName){
    const sList=[]
    this.stateObjectList.forEach((column) =>{
      if(column.entityParentBusinessName ===parentName ){
        sList.push(column.entityBusinessName)
      }
    })

    console.log('slist',sList)
   
    return sList
  }

  /****s**/

  validateEntityRelationship(rowData, columnField, newValue) {
    // Check if the column is entitySuperParentBusinessName
    if(rowData.entitySuperParentBusinessName='') return false;
    if (columnField === 'entitySuperParentBusinessName') {
      // Check if the corresponding entityParentBusinessName is compatible with the new value
      const currentParentBusinessName = rowData.entityParentBusinessName;
      let bool=false;
      // Your specific validation logic
      // For example:
      //const validRelationships = this.fetchState(columnField); // Method to get allowed relationships
      this.stateObjectList.forEach((column) =>{
        if(column.entityParentBusinessName ===newValue){
          if(column.entityBusinessName===currentParentBusinessName) bool=true;
        }
      })

      if(!bool) return false;
      
    }
    
    // If not the specific column or no validation needed, return true
    return true;
  }
  
  // Optional method to show warnings
  showWarning(message: string) {
    // Implement your warning display logic
    // Could be a toast, alert, or setting a warning message
  }


   /****e**/


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
        return  30
      }
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
    suppressHorizontalScroll: false,
    
    

  };


  // for export in excel and csv
  getDownload(format: string) {
    const exportParams: any = {};

    if (format.toLowerCase() === 'excel') {
      // Add Excel-specific formatting options
      exportParams.fileName = 'CityList.xlsx'; // Optional: Customize file name
      exportParams.sheetName = 'Sheet1';   // Optional: Set sheet name
      this.gridApi.exportDataAsExcel({
        onlySelected: (
          document.querySelector("#selectedOnly") as HTMLInputElement
        ).checked,
      });
      
    } else if (format.toLowerCase() === 'csv') {
      // Add CSV-specific formatting options
      exportParams.fileName = 'CityList.csv'; // Optional: Customize file name
      exportParams.columnSeparator = ','; // Optional: Customize separator
      this.gridApi.exportDataAsCsv(exportParams);
    } else {
      console.error('Unsupported format:', format);
    }
    this.toasterService.showSuccess(`Downloaded in ${format} format`)
  }

  onBtPrint() {
    const gridRowData: any[] = [];
    const selectedHeaders: string[] = [];
    const selectedColumns: string[] = [
      'entitySuperParentBusinessName', 
      'entityParentBusinessName', 
      'entityBusinessName', 
      'entityBusinessShortCode', 
      'createdByUser'
    ];
  
    // Loop through column definitions to get matching headers
    this.columnDefs.forEach((column) => {
      if (selectedColumns.includes(column.field)) {
        selectedHeaders.push(column.headerName);
      }
    });
  
    // Loop through rows and extract only selected columns
    this.rowData.forEach((row) => {
      const rowValues = selectedColumns.map(colName => row[colName]);
      gridRowData.push(rowValues);
    });
  
    generatePDF(gridRowData, selectedHeaders,'City');
    this.toasterService.showSuccess('PDF is downloaded');
  }



  /*------------------*/
  //for the pagination

  public pageSizeOptions = [5, 10, 20, 50, 100];
  public paginationPageSize = 10;
  public paginationNumberFormatter: (
    params: PaginationNumberFormatterParams
  ) => string = function (params) {
    return params.value.toLocaleString();
  };

  onPageSizeChanged() {
    const value = (document.getElementById('page-size') as HTMLInputElement)
      .value;
    this.gridApi.paginationSetPageSize(Number(value));
  }

  /*-----------------*/

}





