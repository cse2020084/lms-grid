import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTextCellEditorComponent } from './custom-text-cell-editor.component';

describe('CustomTextCellEditorComponent', () => {
  let component: CustomTextCellEditorComponent;
  let fixture: ComponentFixture<CustomTextCellEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTextCellEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTextCellEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
