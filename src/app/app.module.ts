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

@NgModule({
  declarations: [
    AppComponent,
    ActionComponent,
    CustomTextCellEditor,
    SecondCustomComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AgGridModule.withComponents([AppComponent]),
    MatButtonModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
