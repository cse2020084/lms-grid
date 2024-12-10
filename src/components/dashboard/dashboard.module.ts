import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainPageComponent } from './main-page/main-page.component';
import { SubMenuComponent } from './sub-menu/sub-menu.component';
import { SharedModule } from 'src/shared/shared.module';


@NgModule({
  declarations: [MainPageComponent, SubMenuComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
  ]
})
export class DashboardModule { }
