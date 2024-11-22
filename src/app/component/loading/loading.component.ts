// loading.component.ts
import { Component } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-loading',
  template: `
    <div class="loader-overlay" *ngIf="loading$ | async">
      <div class="loader"></div>
      <div class="loader-text">{{ loaderText$ | async }}</div>
    </div>
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.7);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .loader {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-radius: 50%;
      border-top: 5px solid #3498db;
      animation: spin 1s linear infinite;
    }
    .loader-text {
      margin-top: 15px;
      font-size: 16px;
      color: #333;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingComponent {
  loading$ = this.loaderService.loading$;
  loaderText$ = this.loaderService.loaderText$;

  constructor(private loaderService: LoaderService) {}
}

// // loading.service.ts
// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class LoadingService {
//   private isLoading = new BehaviorSubject<boolean>(false);
//   public loading$ = this.isLoading.asObservable();

//   show() {
//     this.isLoading.next(true);
//   }

//   hide() {
//     this.isLoading.next(false);
//   }
// }

// // Updated app.component.ts
// import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
// import { LoadingService } from './services/loading.service';
// // ... other imports remain the same

// export class AppComponent implements OnInit {
//   loading$ = this.loadingService.loading$;

//   constructor(
//     private dataService: DataService,
//     private cdr: ChangeDetectorRef,
//     private loadingService: LoadingService
//   ) { }

//   // Update loadData method
//   loadData() {
//     this.loadingService.show();
//     const payload = {
//       genericRequestEntity: {
//         companyID: 1,
//         createdBy: 1,
//         mode: 'W',
//         detailFlag: false,
//         dropDown: false
//       }
//     };
    
//     this.dataService.retrieveData('countryservice/getAllCountry', payload)
//       .subscribe(
//         (records: any) => {
//           if (records.statusCode === "200" || records.statusCode === "300") {
//             this.rowData = records.responseList || [];
//             this.gridApi.setRowData(this.rowData);
//           } else {
//             console.error('Error:', records.errorMessage);
//           }
//           this.loadingService.hide();
//         },
//         error => {
//           console.error('Network or server issue:', error);
//           this.loadingService.hide();
//         }
//       );
//   }

//   // Update saveRow method
//   saveRow(item) {
//     if (!item.entityBusinessName || !item.entityBusinessShortCode) {
//       console.error('Error saving row: Mandatory Field is NULL');
//       return;
//     }
    
//     this.loadingService.show();
//     const payload = {
//       genericManipulationRequestEntity: {
//         companyID: 1,
//         createdBy: 1,
//         entityBusinessName: item.entityBusinessName,
//         entityBusinessShortCode: item.entityBusinessShortCode,
//         auditAction: 'C',
//         mode: 'W'
//       }
//     };

//     this.dataService.saveRowData(item, 'countryservice/createEntity', payload)
//       .then((result) => {
//         item.isNew = false;
//         this.isCreatingNewRow = false;
//         this.gridApi.setRowData(this.rowData);
//         this.loadData();
//         this.loadingService.hide();
//       })
//       .catch((errorMessage) => {
//         console.log('error ..');
//         this.loadingService.hide();
//       });

//     this.cdr.markForCheck();
//     this.clickedOnCreateButton = false;
//   }
// }