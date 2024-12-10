import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { menulist } from 'src/script/menulist';
//import { AuthenticationService } from 'src/shared/services/auth.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  @Input() parentLink: string = 'Dashboard';
  @Input() childLink: string = '';
  @Input() subchildLink: string = '';
  constructor(
    private router: Router,
   
  ) { }

  ngOnInit(): void {
  }

  navigateRoute(routeLayer: number) {
    
    switch (routeLayer) {
      case 0:
        this.router.navigate(['./'])
        break;
      case 1:
       // const menuID = this.authService.menuList.find(menu => menu.menuName === this.childLink).menuID || 2;
       const menuID=
       menulist.find(menu => menu.menuName === this.childLink).id || 
       1;
        this.router.navigate(['/dashboard/sub-menu/'+ menuID]);
        break;
      default:
        break;
    }

  }

}
