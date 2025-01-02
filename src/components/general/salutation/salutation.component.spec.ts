import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalutationComponent } from './salutation.component';

describe('SalutationComponent', () => {
  let component: SalutationComponent;
  let fixture: ComponentFixture<SalutationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalutationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalutationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
