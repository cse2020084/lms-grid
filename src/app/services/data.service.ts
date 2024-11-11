import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  
  
  private apiUrl: string = 'https://icare.anikrafoundation.com:8443/lms/';
  private token: string = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJTQSJ9.XX2-sxjOrCKL6L-TCi45demSoIrdGv1Vpj3vLrqk_XxlY7w7J5Yx0MCv5TAIz9PBm5brDWlDhqBTBIdal_qhKw";

  constructor(private http: HttpClient) {}

  /**
   * Retrieves data from the server using a POST request.
   * @returns Observable of the data.
   */
  retrieveData(endpoint,payload): Observable<any> {
    const headers = new HttpHeaders({'Authorization': this.token, 'Content-Type': 'application/json' });
    

    return this.http.post<any>(`${this.apiUrl}${endpoint}`, payload, { headers });
  }

  /**
   * Saves a new row data to the server using a POST request.
   * @param payload Data to save.
   * @returns Observable of the save operation result.
   */
  saveRowData(item,endpoint,payload: any) {
    // const headers = new HttpHeaders({'Authorization': this.token, 'Content-Type': 'application/json' });
    // return this.http.post<any>(`${this.apiUrl}${endpoint}`, payload, { headers });
    console.log('inside save Row data')
    console.log(endpoint, payload)
    return new Promise((resolve, reject) => {
      console.log('inside promise resolve, reject')
      this.retrieveData(endpoint,payload).subscribe((record:any)=>{
        console.log(endpoint, payload)
        
        if (record.statusCode === "200" || record.statusCode === "300") {
          console.log(record)
          resolve(record.responseList[0]);

        } else {
          reject(record.errorMessage)
        }
      },
       (error: HttpErrorResponse) => {
          console.error('Error details:', error.message, error.error);
          reject('Either Internet is not working or some internal server issue');
    })
    })


  }
}
