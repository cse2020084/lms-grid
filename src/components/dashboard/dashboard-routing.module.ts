import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainPageComponent } from './main-page/main-page.component';
import { SubMenuComponent } from './sub-menu/sub-menu.component';
import { CountryComponent } from '../general/country/country.component';


const routes: Routes = [
  {
    path: 'main-page',
    component: MainPageComponent
  },
  {
    path: 'sub-menu/:id',
    component: SubMenuComponent
  },
  // {
  //   path:'/:name',
  //   component: CountryComponent
  // },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'main-page'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
