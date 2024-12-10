import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActionComponent } from './component/action/action.component';
import { AgGridModule } from 'ag-grid-angular';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CustomTextCellEditor } from './component/custom-text-cell-editor/custom-text-cell-editor.component';
import { SecondCustomComponent } from './component/second-custom/second-custom.component';
import { ClearableFloatingFilterComponent } from './component/clearable-floating-filter/clearable-floating-filter.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from './component/loading/loading.component';
import { ToasterComponent } from './toaster/toaster/toaster.component';
import { CustomCountryDropdownComponent } from './component/custom-country-dropdown/custom-country-dropdown.component';
import { NgSelectModule } from '@ng-select/ng-select';




@NgModule({
  declarations: [
    AppComponent,
    // ActionComponent,
    // CustomTextCellEditor,
    // SecondCustomComponent,
    // ClearableFloatingFilterComponent,
    LoadingComponent,
    ToasterComponent,
    //CustomCountryDropdownComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    //AgGridModule.withComponents([]),
    MatButtonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    NgSelectModule,
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
