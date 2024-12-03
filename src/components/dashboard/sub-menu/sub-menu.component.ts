import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { submenulist } from 'src/script/submenulist';

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
    this.subMenuList=submenulist
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
    //this.router.navigateByUrl('/dashboard'+submenu.name);

    // this.router.navigate(['/general', { name:submenu.name }]);
    this.router.navigate(['/general/' + submenu.name.toLowerCase()]);
  }

}
