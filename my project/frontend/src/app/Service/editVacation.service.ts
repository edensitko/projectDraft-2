import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import vacations from '../model/vac';

@Injectable({
  providedIn: 'root'
})
export class EditVacationService {
  constructor(private http: HttpClient) {}
  private apiUrl = 'http://localhost:4000/api/vac';

  getVacationById(vacationId: number): Observable<any> {
    return this.http.get<any>(`http://localhost:4000/api/vac/${vacationId}`);
  }

  updateVacation(id: number, vacationData: vacations): Observable<any> {
    const url = `${this.apiUrl}/updateVac`;
    return this.http.put(url, { ...vacationData });
  }
}