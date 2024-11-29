import { Component, OnInit } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { ToasterService } from 'src/app/toaster/toaster.service';
import { DataService } from 'src/app/services/data.service';
import { Router } from '@angular/router';
import { menulist } from 'src/script/menulist';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  public showImage: boolean = false;
  public showImageCounter: ReturnType<typeof setTimeout>;
  public menuList = [];

  constructor(
    private loader: LoaderService,
    private toastr: ToasterService,
    private router:Router,
  ) { }

  public ngOnInit(): void {
    
    this.menuList =menulist
    this.showImageCounter = setTimeout(() => {
      this.showImage = true;
    }, 500);
  }


  ngOnDestroy(): void {
    if (this.showImageCounter) {
      clearTimeout(this.showImageCounter)
    }
    
  }

  public onClickOfSpecificMenu(menu) {
    this.router.navigateByUrl('/dashboard/sub-menu/' + menu.id);
  }

}
