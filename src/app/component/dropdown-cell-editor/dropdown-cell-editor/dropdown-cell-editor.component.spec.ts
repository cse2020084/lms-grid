import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownCellEditorComponent } from './dropdown-cell-editor.component';

describe('DropdownCellEditorComponent', () => {
  let component: DropdownCellEditorComponent;
  let fixture: ComponentFixture<DropdownCellEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownCellEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownCellEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
