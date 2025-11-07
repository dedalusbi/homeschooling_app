import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ScheduleEntry } from '../models/schedule-entry.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getScheduleForStudent(studentId: string): Observable<{data: ScheduleEntry[]}> {
    return this.http.get<{data: ScheduleEntry[]}>(`${this.apiUrl}/students/${studentId}/schedules`);
  }

  
}
