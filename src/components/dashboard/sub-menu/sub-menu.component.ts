import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.scss']
})
export class SubMenuComponent implements OnInit {

  public showImage: boolean = false;
  public showImageCounter: ReturnType<typeof setTimeout>;
  public subMenuList = [];
  public subMenuName = 'General Master';
  constructor(
    private router:Router,
    private route: ActivatedRoute,

  ) { }

  public ngOnInit(): void {
    this.showImageCounter = setTimeout(() => {
      this.showImage = true;
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.showImageCounter) {
      clearTimeout(this.showImageCounter)
    }
  }

  public onClickOfSpecificSubmenu(submenu) {
    this.router.navigateByUrl('/' + submenu.url);
  }

}
