import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CountryComponent } from './country/country.component';
import { StateComponent } from './state/state.component';
import { CountryResolver } from '../resolver/country.resolver';
import { CityComponent } from './city/city/city.component';


const routes: Routes = [
  {
    path: 'country',
    component: CountryComponent,
    // resolve: {
    //   countries: CountryResolver, // Attach the resolver here
    // },
  },
  {
    path: 'state',
    component: StateComponent
  },
  {
    path: 'city',
    component: CityComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'state'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeneralRoutingModule { }
