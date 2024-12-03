import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomCountryDropdownComponent } from './custom-country-dropdown.component';

describe('CustomCountryDropdownComponent', () => {
  let component: CustomCountryDropdownComponent;
  let fixture: ComponentFixture<CustomCountryDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomCountryDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomCountryDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
