import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearableFloatingFilterComponent } from './clearable-floating-filter.component';

describe('ClearableFloatingFilterComponent', () => {
  let component: ClearableFloatingFilterComponent;
  let fixture: ComponentFixture<ClearableFloatingFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClearableFloatingFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClearableFloatingFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
