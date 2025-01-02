import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ColDef, GridApi, PaginationNumberFormatterParams, RowNode } from 'ag-grid-community';
import { BehaviorSubject } from 'rxjs';
import { ButtonCellRendererComponent } from 'src/app/component/button-renderer/button-cell-renderer/button-cell-renderer.component';
import { CustomTextCellEditor } from 'src/app/component/custom-text-cell-editor/custom-text-cell-editor.component';
import { DataService } from 'src/app/services/data.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ToasterService } from 'src/app/toaster/toaster.service';
import {generatePDF} from '../../../../script/jspdf';
import { ClearableFloatingFilterComponent } from 'src/app/component/clearable-floating-filter/clearable-floating-filter.component';
import { DepartmentService } from 'src/components/services/department/department.service';

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
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent implements OnInit {
  public departmentList$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
  constructor(
    private dataService:DataService,
    private loader:LoaderService,
    private toaster:ToasterService,
    private departmentService: DepartmentService,

  ) { }
  public currentColumnDefs: CustomColDef[];

  ngOnInit(): void {
    this.currentColumnDefs = this.columnDefs
    this.getdepartmentList(false).then((records: any) => {
      this.departmentService.setDepartmentList(records); 
      this.departmentList$.next(records);
     // this.rowData = records.responseList || [];
      this.toaster.showSuccess('Data loaded successfully');
    }).catch(error => {
      this.departmentList$.next([]);
      this.toaster.showError('Failed to load');
    });

    
  
  }

  public rowData: any[] = [];          // Data to be displayed in AG Grid
  public gridApi!: CustomGridApi;
  public gridColumnApi: any;

  public columnDefs: CustomColDef[] = [
      
       
        {
          headerName: 'Department',
          field: 'entityBusinessName',editable: (params) => (params.node as CustomRowNode).isEditing === true,
          minWidth:200,
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
            }
          }
         
        },
        {
          headerName: 'Abbreviation',
          field: 'entityBusinessShortCode',editable: (params) => (params.node as CustomRowNode).isEditing === true,
          minWidth:200,
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
            }
          }
         
        },
        {
          headerName: 'Department Type',
          field: 'departmentType',editable: (params) => (params.node as CustomRowNode).isEditing === true,
          minWidth:200,
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
            }
          }
         
        },
        {
          headerName: 'Remarks',
          field: 'remarks',editable: (params) => (params.node as CustomRowNode).isEditing === true,
          minWidth:200,
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
            }
          }
         
        },
        {
          headerName: 'Last Updated By',
          field: 'createdByUser',
          minWidth:200,
          required:false,
          // cellEditor: 'customCellEditor',
          // cellRenderer: 'customCellEditor',  // Add this line for displaying editable
          // cellEditorParams: {
          //   maxLength: 15, // Optional: Set maximum length
          //   required: false, // Optional: Set if field is required
          //   validationRules: {
          //     onlyLetters: true,
          //     errorMessage: 'Only letters are allowed'
          //   }
          // }
         
        },
        {
          headerName: 'Created On',
          field: 'effectiveDateFrom',
          minWidth:200,
          required:false,
          // cellEditor: 'customCellEditor',
          // cellRenderer: 'customCellEditor',  // Add this line for displaying editable
          // cellEditorParams: {
          //   maxLength: 15, // Optional: Set maximum length
          //   required: false, // Optional: Set if field is required
          //   validationRules: {
          //     onlyLetters: true,
          //     errorMessage: 'Only letters are allowed'
          //   }
          // }
         
        },
        
        
        {
          headerName: 'Actions',
          // field: 'Actions',  
          minWidth:400,
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
      

        // if (params.data && params.data.isNew) {
        //   // return { background: '#f0f8ff' }; // Light blue background for new rows
        //   //return { background: '#c1b3b3' };
  
        //   return {background: '#1AFF0019'}
        // }
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
      minWidth: 100,   // Prevent columns from shrinking too much
      //flex: 1,         // Enable dynamic resizing
    };
    



    getdepartmentList(auditFlag: boolean) {
      return new Promise((resolve, reject) => {
        this.loader.showSpinner('Department list on the way.');
        const payload = {
          genericRequestEntity: {
            companyID: 1,
            createdBy: 1,
            mode: 'W',
            detailFlag: auditFlag,
            dropDown: false
          }
        }
        this.dataService.retrieveData('departmentservice/getAllDepartment', payload).subscribe((records: any) => {
          this.loader.hideSpinner();
          if (records.statusCode === "200" || records.statusCode === "300") {
            records.responseList = records.responseList == null ? [] : records.responseList;
            this.rowData = records.responseList || [];
            console.log(records)
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
      }
  
      this.isInserting = true;
  
      this.gridApi.refreshCells({
        force: true,
        rowNodes: [rowNode]
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
    
    
    const payload = {
      departmentRequestEntity: {
        companyID: 1,
        createdBy: 1,
        entityBusinessName: item.entityBusinessName,
        entityBusinessShortCode: item.entityBusinessShortCode,
        departmentType: item.departmentType,
        remarks: item.remarks,
        auditAction: 'C',
        mode: 'W'
      }
    };
    this.loader.showSpinner('Data is being Saved');
    this.dataService.saveRowData(
      item, 
      'departmentservice/createDepartmentEntity/', 
      payload
    ).then((result) => {
      // Once save is successful, update the grid
      // After successful save, refresh the entire grid data
    this.getdepartmentList(false).then((records: any) => {
      this.departmentList$.next(records);
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
      this.loader.showSpinner('Row is updating')
      const payload = {
        departmentRequestEntity: {
          entityID: item.entityID,
          entityBusinessID: item.entityBusinessID,
          entityBusinessName: item.entityBusinessName,
          entityBusinessShortCode: item.entityBusinessShortCode,
          departmentType: item.departmentType,
          remarks: item.remarks,
          auditAction: 'U',
          companyID: 1,
          createdBy: 1,
          mode: 'W'
        }
      }
      this.dataService.saveRowData(item, 'departmentservice/updateDepartmentEntity/', payload).then((result:any) => {
        if(result && result.entityID) item.entityID=result.entityID;
        this.toaster.showSuccess('Row Updated');
        
      }).catch((errorMessage) => {
    
        this.toaster.showError('Row Not Updated');
      }).finally(()=>{
        this.loader.hideSpinner()
      });
      
    }


    activateRow(item){
      const payload = {
        departmentRequestEntity: {
          entityID: item.entityID,
          entityBusinessID: item.entityBusinessID,
          entityBusinessName: item.entityBusinessName,
          entityBusinessShortCode: item.entityBusinessShortCode,
          departmentType: item.departmentType,
          remarks: item.remarks,
          auditAction: 'A',
          companyID: 1,
          createdBy: 1,
          mode: 'W'
        }
      }
      this.loader.showSpinner('Data is being Activated')
      this.dataService.saveRowData(item,'departmentservice/activateDepartmentEntity',payload).then((result:any) => {
        if (result && result.entityID) item.entityID = result.entityID
        item.activeFlag = 1;
        this.gridApi.applyTransaction({ update: [item] });
        this.gridApi.redrawRows(); 
        this.loader.hideSpinner()
        this.toaster.showSuccess('Row Updated');
        
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
          departmentType: item.departmentType,
          remarks: item.remarks,
          auditAction: 'D',
          companyID: 1,
          createdBy: 1,
          mode: 'W'
        }
      }
      this.loader.showSpinner('Data is being Deactivated')

      this.dataService.saveRowData(item,'departmentservice/deactivateDepartmentEntity',payload).then((result:any) => {
        if (result && result.entityID) item.entityID = result.entityID
        item.activeFlag = 0;
        this.gridApi.applyTransaction({ update: [item] });
        this.gridApi.redrawRows(); 
        this.loader.hideSpinner()
        this.toaster.showSuccess('Row Updated');
        
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
    

  
/***********/
  //showlog

  public logView:boolean=false;
  public logDefs:CustomColDef[]=[
    {headerName: 'Department', field: 'entityBusinessName',required:true},
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
      this.getdepartmentList(true).then((records:any)=>{
        this.departmentList$.next(records)
      })
      .catch(error=>{
        this.departmentList$.next([]);
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
              exportParams.fileName = 'DepartmentList.xlsx'; // Optional: Customize file name
              exportParams.sheetName = 'Sheet1';   // Optional: Set sheet name
              this.gridApi.exportDataAsExcel({
                onlySelected: (
                  document.querySelector("#selectedOnly") as HTMLInputElement
                ).checked,
              });
              
            } else if (format.toLowerCase() === 'csv') {
              // Add CSV-specific formatting options
              exportParams.fileName = 'DepartmentList.csv'; // Optional: Customize file name
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
          
            generatePDF(gridRowData, selectedHeaders,'Department');
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
