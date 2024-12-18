import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ToasterService } from 'src/app/toaster/toaster.service';

@Component({
  selector: 'app-custom-country-dropdown',
  template: `
    <div class="ag-custom-dropdown" (keydown)="onKeyDown($event)">
    <div>
      <input 
        #searchInput
        type="text"
        [(ngModel)]="searchText"
        (input)="filterOptions()"
        placeholder="Search here..."
        class="search-input"
      />
      <button *ngIf="searchText" (click)="clearFilter()" class="delete-button">✖</button>
      </div>
      <select 
        #dropdown 
        [(ngModel)]="selectedValue" 
        (change)="onSelectionChange()"
        class="country-select"
        size="10"
      >
    
        <option 
          *ngFor="let country of filteredOptions" 
          [value]="country"
          (click)="onOptionClick(country)"
          [class.highlight]="country === highlightedOption"
        >
          {{ country }}
        </option>
      </select>
        <!-- Warning Message -->
      <div *ngIf="showWarning" class="warning-message"  aria-live="assertive">
        Please select a country for the new row
      </div>
    </div>
  `,
  styles: [`
    .ag-custom-dropdown {
    position: sticky;
    top:0;
    left:0;
      
      width: 250px;
      height: 250px;
      background: white;
      border: 1px solid #ccc;
      z-index: 10000;
      display: flex;
      flex-direction: column;
    }
    .search-input {
      width: 140px;
      padding: 8px;
      border-bottom: 1px solid #ccc;
    }
    .country-select {
      width: 100%;
      flex-grow: 1;
      overflow-y: auto;
      border: none;

      font-size: 14px;
      background: white;
      color: #333;
      padding: 5px;
      outline: none;
      box-sizing: border-box;
    }
      .warning-message {
      color: red;
      padding: 10px;
      text-align: center;
      background-color: #ffeeee;
      border-top: 1px solid #ffcccc;
    }
      .country-select option {
  padding: 10px;
  background: white;
  color: #333;
  border-bottom: 1px solid #f1f1f1;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.country-select option:hover {
  background-color: #f0f8ff; /* Light blue background on hover */
  color: #0073e6; /* Blue text on hover */
}

.country-select option.highlight {
  background-color: #e6f7ff; /* Highlight color */
  color: #005bb5; /* Darker blue for highlighted text */
}

    button {
        border: none;
        background: none;
        cursor: pointer;
        color:red;
        font-size: 12px;
      }
  `]
})
export class CustomCountryDropdownComponent implements ICellEditorAngularComp {
  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(private toaster:ToasterService){}

  private allOptions: any[] = [];
  filteredOptions: any[] = [];
  searchText: string = '';
  selectedValue: string = '';
  highlightedOption: string = '';
  private params: any;
  public isTemporaryRow: boolean = false;
  public showWarning: boolean = false;

  agInit(params: any): void {
    this.params = params;
    // Check if this is a temporary row
    this.isTemporaryRow = params.node.data.isNew === true;


    console.log(this.isTemporaryRow, params) 

   // this.allOptions = params.options || [];
   if (typeof params.options === 'function') {
    // Call the options function and pass the current params
    const dynamicOptions = params.options(params);
    
    // Process the dynamic options
    this.allOptions = [...new Set((dynamicOptions as string[] || []).map(String))].sort((a, b) => a.localeCompare(b));;
  } else {
   this.allOptions = [...new Set((params.options as string[] || []).map(String))].sort((a, b) => a.localeCompare(b));
  }


   //this.filteredOptions = [...this.allOptions];
   this.filteredOptions = this.allOptions.length === 0 ? ['No country found'] : [...this.allOptions];
    this.selectedValue = params.value || '';
    this.highlightedOption = this.selectedValue || this.filteredOptions[0];
    



    requestAnimationFrame(() => {
      const gridRect = params.eGridCell.getBoundingClientRect();
      const dropdown = this.dropdown.nativeElement.parentElement;
      dropdown.style.top = `${gridRect.top}px`;
      dropdown.style.left = `${gridRect.left}px`;
      dropdown.style.width = `${gridRect.width}px`;
      
      this.searchInput.nativeElement.focus();
    });

       // Add event listener to close on outside click
       document.addEventListener('mousedown', this.handleOutsideClick);


       if(this.isTemporaryRow ){
        // Update parent component with column-specific warning
        if (this.params?.context?.componentParent?.updateColumnWarning) {
          const columnField = this.params.column.getColId();
          this.params.context.componentParent.updateColumnWarning(
            columnField, 
            'Please Enter Some Data'
          );
        }
        params.value===''
    }
  }

  filterOptions() {
    const searchTerm = this.searchText.toLowerCase();
    this.filteredOptions = this.allOptions.filter(option => 
      option.toLowerCase().includes(searchTerm)
    );

    if (this.filteredOptions.length === 0) {
      this.filteredOptions = ['No country found']; // Add placeholder option
    }
    
    // Reset highlighted option to first filtered option
    this.highlightedOption = this.filteredOptions[0];
  }

  onKeyDown(event: KeyboardEvent) {
    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectedValue = this.highlightedOption;
        this.params.stopEditing(true);
        break;
    }
  }

  navigateOptions(direction: number) {
    const currentIndex = this.filteredOptions.indexOf(this.highlightedOption);
    let newIndex = currentIndex + direction;

    // Wrap around if we go out of bounds
    if (newIndex < 0) newIndex = this.filteredOptions.length - 1;
    if (newIndex >= this.filteredOptions.length) newIndex = 0;

    this.highlightedOption = this.filteredOptions[newIndex];

    // Scroll the select to show the highlighted option
    const selectEl = this.dropdown.nativeElement;
    const optionEls = selectEl.querySelectorAll('option');
    if (optionEls[newIndex]) {
      optionEls[newIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  
  // Allows ag-Grid to check if editing can be stopped
  isCancelBeforeStart(): boolean {
    return this.params.cancelBeforeStart || false;
  }

  // Checks if editing can be stopped
  isCancelAfterEnd(): boolean {
    if(this.isTemporaryRow && !this.params.data.entityParentBusinessName){
      return false
    }
    const parent = this.params.context.componentParent;
  
    // Check if this is a parent column that requires relationship validation
    if (this.params.colDef.isParent && parent && parent.validateEntityRelationship) {
      // Validate the relationship using the parent component's method
      const isValidRelationship = parent.validateEntityRelationship(
        this.params.data, 
        this.params.colDef.field, 
        this.selectedValue
      );
  
      // If the relationship is not valid
      if (!isValidRelationship) {
        // Show warning
        if (parent.showWarning) {
          parent.showWarning('Invalid entity relationship');
        }
  
        // Prevent stopping the edit (which effectively prevents saving the invalid value)
        this.showWarning = true;
        this.toaster.showError('Wrong Parent - Child Relation')
        return true;
      }
    }
  
    // For other cases, use the existing logic
    if (!this.selectedValue) {
      this.showWarning = true;
      return true; // Prevents closing the editor
    }
  
    return false;
  }


  onSelectionChange() {
    this.showWarning = false;
    
    this.highlightedOption = this.selectedValue;
    this.params.stopEditing(true);
    this.updateOnClick();
  }

  onOptionClick(country: string): void {
    this.highlightedOption = country; // Update highlighted option
    this.selectedValue = country;    // Synchronize selected value
    this.showWarning = false;        // Hide warning, if any
    this.params.stopEditing(true); 
  }

  highlightOption(country: string) {
    this.highlightedOption = country;
  }

  getValue(): any {
    
    return this.selectedValue;
  }
   
  

  isPopup(): boolean {
    return true;
  }


  // Event listener for outside click
  handleOutsideClick = (event: MouseEvent) => {
    const targetElement = event.target as Node;
    if (
      !this.dropdown.nativeElement.contains(event.target as Node) &&
      !this.searchInput.nativeElement.contains(event.target as Node) &&
      !(targetElement as HTMLElement).classList.contains('delete-button')
    ) {
      this.params.stopEditing(true);
    }
  };

  // Remove the event listener when the component is destroyed
  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  clearFilter(){
   
    // this.params.parentFilterInstance((instance) =>
    //   instance.onFloatingFilterChanged(null, null)
    // );

    // Prevent the click event from propagating
    event.stopPropagation();

    // Clear the search text
    this.searchText = '';

    // Reset the filtered options
    this.filteredOptions = [...this.allOptions];

    // Reset the highlighted option
    this.highlightedOption = this.filteredOptions[0];
  }


  updateOnClick(){
     //
    //  if(this.isTemporaryRow) return;
     if(!this.isTemporaryRow){
     console.log('twmp or not',this.isTemporaryRow)

     const parent = this.params.context.componentParent;

   
       
       // Call parent's editdrpdown method with updated data
       if (parent && parent.editDropDown) {
         console.log('checking data',this.params.colDef.isParent)
         parent.editDropDown(this.params.data);
       }
      }
  }


  private warningMessage: string = '';

  private validateSelection(): void {
    // Your validation logic
    if (!this.selectedValue) {
      this.warningMessage = 'Please select a country';
    } else {
      this.warningMessage = '';
    }

    // Update parent component with column-specific warning
    if (this.params?.context?.componentParent?.updateColumnWarning) {
      const columnField = this.params.column.getColId();
      this.params.context.componentParent.updateColumnWarning(
        columnField, 
        this.warningMessage
      );
    }
  }
}