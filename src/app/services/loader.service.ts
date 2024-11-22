import { Injectable} from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor(private spinner:NgxSpinnerService) { }
  //private dynamicText:string='Please wait'

  // Keep track of loading state
  private isLoading = new BehaviorSubject<boolean>(false);
  public loading$ = this.isLoading.asObservable();


  // Keep your dynamic text functionality
  private dynamicText = new BehaviorSubject<string>('Please wait');
  public loaderText$ = this.dynamicText.asObservable();


   // Get and set for loader text
   get loaderText() {
    return this.dynamicText.value;
  }

  set loaderText(text: string) {
    this.dynamicText.next(text);
  }


   // Enhanced show spinner with text support
   public showSpinner(text?: string) {
    if (text) {
      this.loaderText = text;
    }
    setTimeout(() => {
      this.isLoading.next(true);
    }, 50);
  }

  // Hide spinner
  public hideSpinner() {
    this.isLoading.next(false);
  }

  




}
