import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActionComponent } from 'src/app/component/action/action.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CustomTextCellEditor } from 'src/app/component/custom-text-cell-editor/custom-text-cell-editor.component';
import { SecondCustomComponent } from 'src/app/component/second-custom/second-custom.component';
import { ClearableFloatingFilterComponent } from 'src/app/component/clearable-floating-filter/clearable-floating-filter.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from 'src/app/component/loading/loading.component';
import { ToasterComponent } from 'src/app/toaster/toaster/toaster.component';
import 'ag-grid-enterprise';
import { AgGridModule } from 'ag-grid-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { GeneralRoutingModule } from './general-routing.module';
import { CountryComponent } from './country/country.component';
import { StateComponent } from './state/state.component';
import { CustomCountryDropdownComponent } from 'src/app/component/custom-country-dropdown/custom-country-dropdown.component';
import { StateService } from '../services/state.service';
import {MatSlideToggleModule} from '@angular/material/slide-toggle'
import { SharedModule } from 'src/shared/shared.module';
import { CityComponent } from './city/city/city.component';
import { DepartmentComponent } from './department/department/department.component';
import { SubDepartmentComponent } from './sub-department/sub-department/sub-department.component';
import { RoleComponent } from './role/role.component';
import { DesignationComponent } from './designation/designation.component';
import { SalutationComponent } from './salutation/salutation.component';


@NgModule({
  declarations: [
    CountryComponent,
    SecondCustomComponent,
    ActionComponent,
    ClearableFloatingFilterComponent,
    CustomTextCellEditor,
    StateComponent,
    CustomCountryDropdownComponent,
    CityComponent,
    DepartmentComponent,
    SubDepartmentComponent,
    RoleComponent,
    DesignationComponent,
    SalutationComponent,
    
  ],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    NgSelectModule,
    SharedModule,
    
    AgGridModule.withComponents([CountryComponent,SecondCustomComponent,ActionComponent,ClearableFloatingFilterComponent]),
  ],
  providers: [StateService]
})
export class GeneralModule { }
