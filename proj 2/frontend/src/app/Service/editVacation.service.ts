import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EditVacationService {
  getVacationById(vacationId: any) {
    throw new Error('Method not implemented.');
  }

  constructor(private http: HttpClient) {}

  editVacation(vacationData: any): Observable<any> {
    return this.http.put('http://localhost:4000/api/vac/updateVac', vacationData);
  }
}
