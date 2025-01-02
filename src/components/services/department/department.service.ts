import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Department {
  entityBusinessName: string;
  [key: string]: any;  // for other properties
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private departmentListSubject = new BehaviorSubject<Department[]>([]);
  public departmentList$ = this.departmentListSubject.asObservable();

  constructor() {}

  setDepartmentList(departments: Department[]) {
    this.departmentListSubject.next(departments);
  }

  getDepartmentList(): Observable<Department[]> {
    return this.departmentList$;
  }

  // Helper method to get just the department names
  getDepartmentNames(): Observable<string[]> {
    return this.departmentList$.pipe(
      map(departments => departments.map(dept => dept.entityBusinessName))
    );
  }

  // Helper method to check if a department exists
  isDepartmentValid(departmentName: string): Observable<boolean> {
    return this.departmentList$.pipe(
      map(departments => departments.some(
        dept => dept.entityBusinessName.toLowerCase() === departmentName.toLowerCase()
      ))
    );
  }
}