



import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
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
    



  //   // BehaviorSubject to store and emit state data
  //  countriesSubject = new BehaviorSubject<any[] | null>([]);

  // // Observable for components to subscribe to state data
  // countries$: Observable<any[]> = this.countriesSubject.asObservable();

  // // Method to update state data
  // updateStateData(data: any[]) {
  //  // this.countriesSubject.next(data);
  //   this.countriesSubject.next([...data]);
    
  //   console.log('countries',this.countries$)
  //   console.log('data',data)
  //   console.log('countries',this.countriesSubject.getValue())
  // }

  // // Method to get current state data
 
  // getCurrentStateData(): any[] | null {
  //   return this.countriesSubject.getValue();
  // }


  // // Add a method to explicitly check current value
  // debugCurrentValue() {
  //   console.log('Current BehaviorSubject value:', this.countriesSubject.getValue());
  // }



  loadState(auditFlag: boolean): Observable<any[]> {
    const payload = {
      genericRequestEntity: {
        companyID: 1,
        createdBy: 1,
        mode: 'W',
        detailFlag: auditFlag,
        dropDown: false,
      },
    };
  
    return this.dataService.retrieveData('stateservice/getAllState/', payload).pipe(
      map((records: any) => {
        if (records.statusCode === '200' || records.statusCode === '300') {
          // Return the response list or an empty array
          return records.responseList || [];
        } else {
          // Throw an error for failed API calls
          throw new Error(records.errorMessage || 'Failed to load data');
        }
      }),
      catchError((error) => {
        console.error('Error occurred while fetching data:', error);
        // Throw an error to the subscriber
        return throwError(() => new Error(error.message || 'Network error occurred'));
      })
    );
  }

  
  stateDataSubject = new BehaviorSubject<any[]>([]);

loadStateAndUpdate(auditFlag: boolean): Observable<any[]> {
  return this.loadState(auditFlag).pipe(
    tap((data) => {
      this.stateDataSubject.next(data); // Update the BehaviorSubject
    })
  );
}

get stateData$(): Observable<any[]> {
  return this.stateDataSubject.asObservable();
}

  
  
 }
