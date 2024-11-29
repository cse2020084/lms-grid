import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ActionComponent } from 'src/app/component/action/action.component';
// import { MatButtonModule } from '@angular/material/button';
// import { FormsModule } from '@angular/forms';
// import { SecondCustomComponent } from 'src/app/component/second-custom/second-custom.component';
// import { ClearableFloatingFilterComponent } from 'src/app/component/clearable-floating-filter/clearable-floating-filter.component';
// import { MatCardModule } from '@angular/material/card';
// import { MatIconModule } from '@angular/material/icon';
// import { LoadingComponent } from 'src/app/component/loading/loading.component';
// import { ToasterComponent } from 'src/app/toaster/toaster/toaster.component';


import { GeneralRoutingModule } from './general-routing.module';
import { CountryComponent } from './country/country.component';


@NgModule({
  declarations: [CountryComponent],
  imports: [
    CommonModule,
    GeneralRoutingModule,
  ]
})
export class GeneralModule { }
