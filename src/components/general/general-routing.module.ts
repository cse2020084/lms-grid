import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CountryComponent } from './country/country.component';
import { StateComponent } from './state/state.component';


const routes: Routes = [
  {
    path: 'country',
    component: CountryComponent
  },
  {
    path: 'state',
    component: StateComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'country'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralRoutingModule { }
