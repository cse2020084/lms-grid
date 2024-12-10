



import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DataService } from 'src/app/services/data.service';

@Injectable({
  providedIn: 'root',
})
export class StateService {

  public check=false;
  constructor(
    private dataService:DataService,
  ){

  }
    



    // BehaviorSubject to store and emit state data
   countriesSubject = new BehaviorSubject<any[] | null>([]);

  // Observable for components to subscribe to state data
  countries$: Observable<any[]> = this.countriesSubject.asObservable();

  // Method to update state data
  updateStateData(data: any[]) {
   // this.countriesSubject.next(data);
    this.countriesSubject.next([...data]);
    
    console.log('countries',this.countries$)
    console.log('data',data)
    console.log('countries',this.countriesSubject.getValue())
  }

  // Method to get current state data
 
  getCurrentStateData(): any[] | null {
    return this.countriesSubject.getValue();
  }


  // Add a method to explicitly check current value
  debugCurrentValue() {
    console.log('Current BehaviorSubject value:', this.countriesSubject.getValue());
  }
  

  
  

  
}
