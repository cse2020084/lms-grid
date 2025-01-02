import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CountryComponent } from './country/country.component';
import { StateComponent } from './state/state.component';
import { CountryResolver } from '../resolver/country.resolver';
import { CityComponent } from './city/city/city.component';
import { DepartmentComponent } from './department/department/department.component';
import { SubDepartmentComponent } from './sub-department/sub-department/sub-department.component';
import { RoleComponent } from './role/role.component';
import { DesignationComponent } from './designation/designation.component';
import { SalutationComponent } from './salutation/salutation.component';


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
    path: 'department',
    component: DepartmentComponent
  },
  {
    path: 'sub-department',
    component: SubDepartmentComponent
  },
  {
    path: 'role',
    component: RoleComponent
  },
  {
    path: 'designation',
    component: DesignationComponent
  },
  {
    path: 'salutation',
    component: SalutationComponent
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
