import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { StateService } from '../services/state.service';

@Injectable({
  providedIn: 'root',
})
export class CountryResolver implements Resolve<any[]> {
  constructor(private stateService: StateService) {}

  resolve(): Observable<any[]> {
    // Wait for dynamically populated data
    return this.stateService.countries$.pipe(
      filter((countries) => countries && countries.length > 0), // Ensure non-empty data
      first() // Complete after the first emission
    );
  }
}
