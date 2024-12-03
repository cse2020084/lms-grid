import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  
    {
      path: 'dashboard',
      loadChildren: () => import('../components/dashboard/dashboard.module').then(m => m.DashboardModule),     
    },
    {
      path: 'general',
      loadChildren: () => import('../components/general/general.module').then(m => m.GeneralModule),

    },
    {
      path: '**',
      redirectTo: 'dashboard'
    }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
