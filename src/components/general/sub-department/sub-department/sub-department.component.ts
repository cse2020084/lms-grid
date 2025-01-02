import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, PaginationNumberFormatterParams, RowNode } from 'ag-grid-community';
import { BehaviorSubject, of } from 'rxjs';
import { ButtonCellRendererComponent } from 'src/app/component/button-renderer/button-cell-renderer/button-cell-renderer.component';
import { CustomTextCellEditor } from 'src/app/component/custom-text-cell-editor/custom-text-cell-editor.component';
import { DataService } from 'src/app/services/data.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToasterService } from 'src/app/toaster/toaster.service';
import {generatePDF} from '../../../../script/jspdf';
import { ClearableFloatingFilterComponent } from 'src/app/component/clearable-floating-filter/clearable-floating-filter.component';
import { DropdownCellEditorComponent } from 'src/app/component/dropdown-cell-editor/dropdown-cell-editor/dropdown-cell-editor.component';
import { DepartmentComponent } from '../../department/department/department.component';
import { DepartmentService } from 'src/components/services/department/department.service';
import { catchError, map } from 'rxjs/operators';
import { CustomCountryDropdownComponent } from 'src/app/component/custom-country-dropdown/custom-country-dropdown.component';



interface CustomColDef extends ColDef {
  // Define your custom properties here
  validationRules?: {
    onlyLetters?: boolean;
    // pattern?: RegExp;
    errorMessage?: string;
  };
  required:boolean;
  
}

// Add this interface at the top of your file
interface CustomRowNode extends RowNode {
  isEditing?: boolean;
  originalData?: any;
  error?:any;
  fieldErrors?: { [key: string]: ValidationError };  // Track errors by field name
  hasError?:boolean;
}

interface ValidationError {
  type: 'duplicate' | 'empty' | 'maxLength' | 'pattern';
  message: string;
}

interface CustomGridApi extends GridApi {
  getDisplayedRowAtIndex(index: number): CustomRowNode;
}

@Component({
  selector: 'app-sub-department',
  templateUrl: './sub-department.component.html',
  styleUrls: ['./sub-department.component.scss']
})
export class SubDepartmentComponent implements OnInit {
  public subDepartmentList$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  public departmentList:any[]=[]
  public departmentObjectList:any[]=[];
  constructor(
    private dataService:DataService,
    private loader:LoaderService,
    private toaster:ToasterService,

    private departmentService: DepartmentService 

  ) { }

  public currentColumnDefs: CustomColDef[];

  ngOnInit(): void {
    this.currentColumnDefs=this.columnDefs;

    this.loader.showSpinner('Department list on the way.');
    // this.getDepartmentList().then((departments: any[]) => {
    //   departments.forEach((items)=>{
    //     if(items.activeFlag===1){
    //       this.departmentList.push(items.entityBusinessName)
    //     }
    //   })

    // this.getDepartmentList(false).then((resolve)=>{
    //   console.log('dept obj list',this.departmentObjectList)
    //   console.log('resolve',resolve)
    // })
     
    this.getSubdepartmentList(false)
  //})
  .then((records: any) => {
      this.subDepartmentList$.next(records);
     // this.rowData = records.responseList || [];
     
      this.toaster.showSuccess('Data loaded successfully');
    }).catch(error => {
      this.subDepartmentList$.next([]);
      
      this.toaster.showError('Failed to load');
    });


    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
    //this.loadDepartments();
  }

  getDepartmentList(detailFlag=false) {
    return new Promise((resolve, reject) => {
      const payload = {
        genericRequestEntity: {
          companyID: 1,
          createdBy: 1,
          entityBusinessID: null,
          mode: 'W',
          detailFlag,
          dropDown: true
        }
      };
      
      this.dataService.retrieveData('departmentservice/getAllDepartment', payload)
        .subscribe((response: any) => {
          if (response.statusCode === "200" || response.statusCode === "300") {
            // Update countryObjectList with both ID and Name
            this.departmentObjectList = response.responseList
            .map((item: any) => ({
              entityBusinessName: item.entityBusinessName,
              entityBusinessID: item.entityBusinessID
            }));
            resolve(response.responseList || []);
          } else {
            reject(response.errorMessage);
          }
        }, error => reject(error));
    });
  }
  

  public rowData: any[] = [];          // Data to be displayed in AG Grid
  public gridApi!: CustomGridApi;
  public gridColumnApi: any;

  // departmentList$ = new BehaviorSubject<any[]>([]);
  // private loadDepartments() {
  //   const payload = {
  //     genericRequestEntity: {
  //       companyID: 1,
  //       createdBy: 1,
  //       mode: 'W',
  //       detailFlag: false,
  //       dropDown: true
  //     }
  //   };

  //   this.dataService.retrieveData('departmentservice/getAllDepartment', payload)
  //     .pipe(
  //       map(response => response.responseList || []),
  //       catchError(err => {
  //         console.error('Failed to load departments:', err);
  //         return of([]);
  //       })
  //     )
  //     .subscribe(departments => {
  //       this.departmentList$.next(departments);
  //       this.refreshGrid();
  //       console.log(this.departmentList$.value)
  //     });
  // }

  // private refreshGrid() {
  //   if (this.gridApi) {
  //     this.gridApi.refreshCells({
  //       force: true,
  //       columns: ['entityParentBusinessName']
  //     });
  //   }
  // }

  public columnDefs: CustomColDef[] = [
      
       
        {
          headerName: 'Department',sortable: true,
          field: 'entityParentBusinessID',editable: (params) => (params.node as CustomRowNode).isEditing === true,
          width:300,
          valueGetter: (params) => {
            return params.data.entityParentBusinessName;
          },
          valueSetter: (params) => {
            // Find the matching department object from your list
            const selectedDept = this.departmentList.find(dept => dept.entityBusinessName === params.newValue);
            if (selectedDept) {
              params.data.entityParentBusinessID = selectedDept.entityBusinessID;
              params.data.entityParentBusinessName = selectedDept.entityBusinessName;
              return true;
            }
            return false;
          },
          required:true,
          filter: "agTextColumnFilter",
                          floatingFilter: true,
                          ///temporary, as i like simple better
                          floatingFilterComponentParams: {
                            suppressFilterButton: true, // Removes the default filter button
                          },
                          floatingFilterComponentFramework: ClearableFloatingFilterComponent,
          cellEditor: 'dropdownCellEditor',
          // cellRenderer: 'dropdownCellEditor',
          cellEditorParams: (params) => {
            return {
              options: this.departmentList.map(dept => dept.entityBusinessName) ,
              required: true
          }
        },
        cellRenderer: params => {
          if (params.data.isNew && !params.data.entityParentBusinessName) {
            
            const warning = 'You have to choose';
            return `
            <div class="custom-cell-renderer" ;>
              <input 
                value="${params.value || ''}"
                placeholder="Choose Department"
                style="width: calc(100% - 20px); padding: 8px; font-size: 14px;}"
              />
               ${warning ? `<div class="warning-message" style="color:red ">${warning}</div>` : ''}
              
            </div>
          `;
          }
         
          return params.value;
        },
        singleClickEdit: true
        },
        {
          headerName: 'Sub-Department',
          field: 'entityBusinessName',editable: (params) => (params.node as CustomRowNode).isEditing === true,
          width:300,
          required:true,
          filter: "agTextColumnFilter",
                floatingFilter: true,
                ///temporary, as i like simple better
                floatingFilterComponentParams: {
                  suppressFilterButton: true, // Removes the default filter button
                },
                floatingFilterComponentFramework: ClearableFloatingFilterComponent,
          cellEditor: 'customCellEditor',
          cellRenderer: 'customCellEditor',  // Add this line for displaying editable
          cellEditorParams: {
            maxLength: 15, // Optional: Set maximum length
            required: true, // Optional: Set if field is required
            validationRules: {
              onlyLetters: true,
              errorMessage: 'Only letters are allowed'
            },
            metadata:{
              parentField:['entityParentBusinessName']
            },
          }
         
        },
        {
          headerName: 'Abbreviation',
          field: 'entityBusinessShortCode',editable: (params) => (params.node as CustomRowNode).isEditing === true,
          width:300,
          required:true,
          filter: "agTextColumnFilter",
                floatingFilter: true,
                ///temporary, as i like simple better
                floatingFilterComponentParams: {
                  suppressFilterButton: true, // Removes the default filter button
                },
                floatingFilterComponentFramework: ClearableFloatingFilterComponent,
          cellEditor: 'customCellEditor',
          cellRenderer: 'customCellEditor',  // Add this line for displaying editable
          cellEditorParams: {
            maxLength: 5, // Optional: Set maximum length
            required: true, // Optional: Set if field is required
            validationRules: {
              onlyLetters: true,
              errorMessage: 'Only letters are allowed'
            },
            metadata:{
              parentField:['entityParentBusinessName']
            },
          }
         
        },
        {
          headerName: 'Dep. Type',
          field: 'departmentType',editable: (params) => (params.node as CustomRowNode).isEditing === true,
          width:300,
          required:true,
          filter: "agTextColumnFilter",
                floatingFilter: true,
                ///temporary, as i like simple better
                floatingFilterComponentParams: {
                  suppressFilterButton: true, // Removes the default filter button
                },
                floatingFilterComponentFramework: ClearableFloatingFilterComponent,
          cellEditor: 'customCellEditor',
          cellRenderer: 'customCellEditor',  // Add this line for displaying editable
          cellEditorParams: {
            maxLength: 15, // Optional: Set maximum length
            required: true, // Optional: Set if field is required
            validationRules: {
              onlyLetters: true,
              errorMessage: 'Only letters are allowed'
            },
            metadata:{
              parentField:['entityParentBusinessName']
            },
          }
         
        },
        {
          headerName: 'Remarks',
          field: 'remarks',editable: (params) => (params.node as CustomRowNode).isEditing === true,
          width:300,
          required:true,
          filter: "agTextColumnFilter",
                floatingFilter: true,
                ///temporary, as i like simple better
                floatingFilterComponentParams: {
                  suppressFilterButton: true, // Removes the default filter button
                },
                floatingFilterComponentFramework: ClearableFloatingFilterComponent,
          cellEditor: 'customCellEditor',
          cellRenderer: 'customCellEditor',  // Add this line for displaying editable
          cellEditorParams: {
            maxLength: 15, // Optional: Set maximum length
            required: true, // Optional: Set if field is required
            validationRules: {
              onlyLetters: true,
              errorMessage: 'Only letters are allowed'
            },
            metadata:{
              parentField:['entityParentBusinessName']
            },
          }
         
        },
        {
          headerName: 'Last Updated By',
          field: 'createdByUser',
          width:250,
          required:false,
          
         
        },
        {
          headerName: 'Created On',
          field: 'effectiveDateFrom',
          width:400,
          required:false,
         
        },
        
        
        {
          headerName: 'Actions',
          // field: 'Actions',  
          width:400,
          required:false,
          cellRenderer: 'buttonCellRenderer',
          cellRendererParams: {
            onSave: this.onSaveRow.bind(this),
            onCancel:this.onCancelInsert.bind(this),
            updateRow:this.updateRow.bind(this),
            activateRow: this.activateRow.bind(this),
            deactivateRow: this.deactivateRow.bind(this)
          }
          
        },
        
       
    ];
    

  frameworkComponents = {
      buttonCellRenderer: ButtonCellRendererComponent,
      customCellEditor:CustomTextCellEditor,
      dropdownCellEditor: DropdownCellEditorComponent,
      
      
    };

  /**
  * Initializes grid API and loads data after the grid is ready.
  * @param params Grid parameters
  */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    
    console.log('params saved:', params);

   

    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }


  }


    //making this component the parent one
    public gridOptions = {
      context: {
        componentParent: this,
        //isCreatingNewRow: this.isCreatingNewRow // Pass the variable
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
      if (params.data && params.data.activeFlag !== 1 && !params.data.isNew) {
        return { backgroundColor: '#e0e0e0', opacity: 0.6 }; 
      }
      

        if (params.data && params.data.isNew) {
          // return { background: '#f0f8ff' }; // Light blue background for new rows
          //return { background: '#c1b3b3' };
  
          return {background: '#1AFF0019'}
        }
        return null; // Default style for other rows
      },
      suppressRowClickSelection: true,
      suppressHorizontalScroll: false,
      // rowClassRules: {
      //   'inactive': (params) => params.data.activeFlag !== 1, // Apply 'inactive' class when activeFlag is not 1
      // },

     
      
      
  
    };

    defaultColDef = {
      //suppressAutoSize: true,
      resizable: true, // Allow columns to resize
      //width: 100,   // Prevent columns from shrinking too much
      //flex: 1,         // Enable dynamic resizing
    };
    



    getSubdepartmentList(auditFlag: boolean) {
      return new Promise((resolve, reject) => {
       
        const payload = {
          genericRequestEntity: {
            companyID: 1,
            createdBy: 1,
            mode: 'W',
            detailFlag: auditFlag,
            dropDown: false
          }
        }
        this.dataService.retrieveData('subdepartmentservice/getAllSubDepartment/', payload).subscribe((records: any) => {
          
          if (records.statusCode === "200" || records.statusCode === "300") {
            records.responseList = records.responseList == null ? [] : records.responseList;
            this.rowData = records.responseList || [];
            console.log(records)
            this.loader.hideSpinner();
            resolve(records.responseList);
          } else {
            reject(records.errorMessage);
          }
        }, (error: HttpErrorResponse) => {
          this.loader.hideSpinner();
          reject('Either Internet is not working or facing internal server issue')
        })
      })
    }

    // Add a flag to track if we're in insert mode
    public isInserting: boolean = false;
    addNewRow(): void {
      if (this.isInserting) {
        return; // Prevent multiple inserts
      }
      this.isInserting = true;
  
      // Load departments before adding new row
    this.loadDepartmentsForEdit(false).then(() => {
      const newItem = {
        isNew: true,
      };
  
      // Use updateRowData instead of modifying rowData directly
      this.gridApi.applyTransaction({
        add: [newItem],
        addIndex: 0
      });
  
      const rowNode = this.gridApi.getDisplayedRowAtIndex(0);
      if (rowNode) {
        rowNode.isEditing = true; // No type assertion needed since we're using CustomGridApi
        rowNode.setRowHeight(80);

        this.gridApi.onRowHeightChanged();
        // this.getDepartmentList(false).then((resolve:any[])=>{
        //   this.departmentList=resolve
        //   //.map((item:any)=>item.entityBusinessName)
        // })

         

        // Start editing the department cell immediately
    // setTimeout(() => {
    //   this.gridApi.startEditingCell({
    //     rowIndex: 0,
    //     colKey: 'entityParentBusinessName' // your department column field
    //   });
    // });
      }
  
      
  
      this.gridApi.refreshCells({
        force: true,
        rowNodes: [rowNode]
      });

    });
    }
  
    onCancelInsert(): void {
      const firstRow = this.gridApi.getDisplayedRowAtIndex(0);
      if (firstRow && firstRow.data.isNew) {
        // Remove the row using updateRowData
        this.gridApi.applyTransaction({
          remove: [firstRow.data]
        });
        this.isInserting = false;
        console.log()
        
        // Refresh the grid
        this.gridApi.refreshCells({
          force: true
        });
      }
    }

   
   onSaveRow(item: any): void {
    
      // Find the corresponding entityParentBusinessID
      const selectedCountry = this.departmentObjectList.find(data => 
        data.entityBusinessName === item.entityParentBusinessName
      );
      console.log('item',item)
      const payload = {
        departmentRequestEntity: {
          companyID: 1,
          createdBy: 1,
          entityBusinessName: item.entityBusinessName,
          entityBusinessShortCode: item.entityBusinessShortCode,
          entityParentBusinessID: item.entityParentBusinessID,
          departmentType: item.departmentType,
          remarks: item.remarks,
          auditAction: 'C',
          mode: 'W'
        }
      }
        this.loader.showSpinner('Data is being Saved');
        this.dataService.saveRowData(
          item, 
          'subdepartmentservice/createSubDepartment/', 
          payload
        ).then((result) => {
          // Once save is successful, update the grid
          // After successful save, refresh the entire grid data
        this.getSubdepartmentList(false).then((records: any) => {
          this.subDepartmentList$.next(records);
          // this.rowData = records;
          this.isInserting = false;
          const firstRow = this.gridApi.getDisplayedRowAtIndex(0);
          if (firstRow) {
            firstRow.isEditing = false;
          }
          this.loader.hideSpinner();
          this.toaster.showSuccess('Data saved successfully');
        });

          
        }).catch((error) => {
          this.loader.hideSpinner();
          this.toaster.showError(`Not saved ${error}`);
          
          // Optional: Keep the row in edit mode if save failed
          const firstRow = this.gridApi.getDisplayedRowAtIndex(0);
          if (firstRow) {
            firstRow.isEditing = true;
          }
        });
  }

    updateRow(item){

      const selectedItem = this.departmentObjectList.find(data => 
        data.entityBusinessName === item.entityParentBusinessName
      );
      console.log('dept object',this.departmentObjectList)
      this.loader.showSpinner('Data is being Saved');
      const payload = {
        departmentRequestEntity: {
          entityID: item.entityID,
          entityBusinessID: item.entityBusinessID,
          entityBusinessName: item.entityBusinessName,
          entityBusinessShortCode: item.entityBusinessShortCode,
          entityParentBusinessID: item.entityParentBusinessID,
          departmentType: item.departmentType,
          remarks: item.remarks,
          auditAction: 'U',
          companyID: 1,
          createdBy: 1,
          mode: 'W'
        }
      }
      this.dataService.saveRowData(item, 'subdepartmentservice/updateSubDepartment/', payload).then((result:any) => {
        if (result && result.entityID) item.entityID = result.entityID
        
        this.loader.hideSpinner();
        this.toaster.showSuccess('Row Updated');
        
      }).catch((errorMessage) => {
        this.loader.hideSpinner();
        this.toaster.showError(`Row Not Updated'${errorMessage}`);
        console.log('error-message',errorMessage)
      });
      
      
    }


    activateRow(item){
      const payload = {
        departmentRequestEntity: {
          entityID: item.entityID,
          entityBusinessID: item.entityBusinessID,
          entityBusinessName: item.entityBusinessName,
          entityBusinessShortCode: item.entityBusinessShortCode,
          entityParentBusinessID: item.entityParentBusinessID,
          departmentType: item.departmentType,
          remarks: item.remarks,
          auditAction: 'A',
          companyID: 1,
          createdBy: 1,
          mode: 'W'
        }
      }
      this.loader.showSpinner('Data is being Activated')
      this.dataService.saveRowData(item,'subdepartmentservice/activateSubDepartment',payload).then((result:any) => {
        if (result && result.entityID) item.entityID = result.entityID
        item.activeFlag = 1;
        this.gridApi.applyTransaction({ update: [item] });
        this.gridApi.redrawRows(); 
        this.loader.hideSpinner()
        this.toaster.showSuccess('Row Activated');
        
      }).catch((errorMessage) => {
        this.loader.hideSpinner()
        this.toaster.showError('Row Not Updated');
      });
      
    }


    deactivateRow(item){
      const payload = {
        departmentRequestEntity: {
          entityID: item.entityID,
          entityBusinessID: item.entityBusinessID,
          entityBusinessName: item.entityBusinessName,
          entityBusinessShortCode: item.entityBusinessShortCode,
          entityParentBusinessID: item.entityParentBusinessID,
          departmentType: item.departmentType,
          remarks: item.remarks,
          auditAction: 'D',
          companyID: 1,
          createdBy: 1,
          mode: 'W'
        }
      }
      this.loader.showSpinner('Data is being Deactivated')

      this.dataService.saveRowData(item,'subdepartmentservice/deactivateSubDepartment',payload).then((result:any) => {
        if (result && result.entityID) item.entityID = result.entityID
        item.activeFlag = 0;
        this.gridApi.applyTransaction({ update: [item] });
        this.gridApi.redrawRows(); 
        this.loader.hideSpinner()
        this.toaster.showSuccess('Row Deactivated');
        
      }).catch((errorMessage) => {
        this.loader.hideSpinner()
        this.toaster.showError('Row Not Updated');
      });
      
    }


    

    isColumnEditable(params:any):boolean{
      return params.node.isEditing===true;
    }

    isAnyRowEditing(): boolean {
      let isInEditing = false;
      if (this.gridApi) {
        this.gridApi.forEachNode((node: CustomRowNode) => {
          if (node.isEditing || node.data.isNew) {
            isInEditing = true;
          }
        });

      

      }
      return isInEditing || this.isInserting;
    }


    // New method to load departments efficiently
    private isDepartmentLoading : boolean=false;
  loadDepartmentsForEdit(flag): Promise<void> {
    // If already loading, return existing promise
    if (this.isDepartmentLoading) {
      return Promise.resolve();
    }
    
    // // If departments are already loaded, no need to reload
    // if (this.departmentList && this.departmentList.length > 0) {
    //   return Promise.resolve();
    // }

    this.isDepartmentLoading = true;
    this.loader.showSpinner('DropDown List is Loading')
    
    return this.getDepartmentList(flag)
      .then((departments: any[]) => {
        this.departmentList = departments;
        
      })
      .catch(error => {
        console.error('Error loading departments:', error);
        this.toaster.showError('Failed to load departments');
      })
      .finally(() => {
        this.isDepartmentLoading = false;
        this.loader.hideSpinner()
      });
  }
    


  /***********/
  //showlog

  public logView:boolean=false;
  public logDefs:CustomColDef[]=[
    {headerName: 'Department', field: 'entityParentBusinessID',required:true},
    {headerName: 'Sub-Department', field: 'entityBusinessName',required:true},
    {headerName: 'Abbreviation', field: 'entityBusinessShortCode',required:true},
    {headerName: 'Type', field: 'departmentType',required:true},
    {headerName: 'Remarks', field: 'remarks',required:true},
    {headerName: 'Last Updated By', field: 'createdByUser',required:true},
    {headerName: 'Last Modified on', field: 'effectiveDateFrom',required:true},
    {headerName: 'Audit Action', field: 'auditAction',required:true}
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
    
    if(toggleFlag){
      this.getSubdepartmentList(true).then((records:any)=>{
        this.subDepartmentList$.next(records)
      })
      .catch(error=>{
        this.subDepartmentList$.next([]);
      })
    }else{
      this.ngOnInit();
    }
  
}



  /*******END*******/


      // for export in excel and csv
      getDownload(format: string) {
        const exportParams: any = {};
    
        if (format.toLowerCase() === 'excel') {
          // Add Excel-specific formatting options
          exportParams.fileName = 'SubDepartmentList.xlsx'; // Optional: Customize file name
          exportParams.sheetName = 'Sheet1';   // Optional: Set sheet name
          this.gridApi.exportDataAsExcel({
            onlySelected: (
              document.querySelector("#selectedOnly") as HTMLInputElement
            ).checked,
          });
          
        } else if (format.toLowerCase() === 'csv') {
          // Add CSV-specific formatting options
          exportParams.fileName = 'SubDepartmentList.csv'; // Optional: Customize file name
          exportParams.columnSeparator = ','; // Optional: Customize separator
          this.gridApi.exportDataAsCsv(exportParams);
        } else {
          console.error('Unsupported format:', format);
        }
        this.toaster.showSuccess(`Downloaded in ${format} format`)
      }
    
      onBtPrint() {
        const gridRowData: any[] = [];
        const selectedHeaders: string[] = [];
        const selectedColumns: string[] = [
          'entityParentBusinessID', 
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
      
        generatePDF(gridRowData, selectedHeaders,'Sub-Department');
        this.toaster.showSuccess('PDF is downloaded');
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
