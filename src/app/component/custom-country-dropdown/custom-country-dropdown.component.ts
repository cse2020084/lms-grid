import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';

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
        placeholder="Search countries..."
        class="search-input"
      />
      <button *ngIf="searchText" (click)="clearFilter()" class="delete-button">✖</button>
      </div>
      <select 
        #dropdown 
        [(ngModel)]="selectedValue" 
        (change)="onSelectionChange()"
        class="country-select"
        size="5"
      >
        <option 
          *ngFor="let country of filteredOptions" 
          [value]="country"
          [selected]="country === highlightedOption"
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
    position: fixed;
    top:0;
    left:0;
      
      width: 250px;
      height: 250px;
      background: white;
      border: 1px solid #ccc;
      z-index: 1000;
      display: flex;
      flex-direction: column;
    }
    .search-input {
      width: 130px;
      padding: 8px;
      border-bottom: 1px solid #ccc;
    }
    .country-select {
      width: 100%;
      flex-grow: 1;
      overflow-y: auto;
      border: none;
    }
      .warning-message {
      color: red;
      padding: 10px;
      text-align: center;
      background-color: #ffeeee;
      border-top: 1px solid #ffcccc;
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
   this.allOptions = [...new Set((params.options as string[] || []).map(String))].sort((a, b) => a.localeCompare(b));

   this.filteredOptions = [...this.allOptions];
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
    // If it's a temporary row and no value is selected, prevent stopping
    if ( !this.selectedValue) {
      this.showWarning = true;
      return true; // Prevents closing the editor
    }
    return false;
  }


  onSelectionChange() {
    this.showWarning = false;
    this.params.stopEditing(true);
    this.updateOnClick();
  }

  highlightOption(country: string) {
    this.highlightedOption = country;
  }

  getValue(): any {
    
    return this.selectedValue;
  }
   // return this.selectedValue;
  

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
         console.log(this.params.data)
         parent.editDropDown(this.params.data);
       }
      }
  }
}