import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondCustomComponent } from './second-custom.component';

describe('SecondCustomComponent', () => {
  let component: SecondCustomComponent;
  let fixture: ComponentFixture<SecondCustomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondCustomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
