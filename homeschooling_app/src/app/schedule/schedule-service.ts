import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ScheduleEntry } from '../models/schedule-entry.model';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getScheduleForStudent(studentId: string, onlyMine: boolean, weekStart: string, weekEnd: string): Observable<{data: ScheduleEntry[]}> {
    
    let params = new HttpParams();
    params = params.set('filter[only_mine]', String(onlyMine));
    params = params.set('filter[week_start]', weekStart);
    params = params.set('filter[week_end]', weekEnd);
    
    
    return this.http.get<{data: ScheduleEntry[]}>(`${this.apiUrl}/students/${studentId}/schedules`, {params});
  }

  createSchedule(aulaData: any): Observable<{data: ScheduleEntry[]}> {
    return this.http.post<{data: ScheduleEntry[]}>(`${this.apiUrl}/schedules`,{
      aula: aulaData
    });
  }


  getScheduleForAllStudents(onlyMine: boolean, weekStart: string, weekEnd: string): Observable<{data: ScheduleEntry[]}> {

    let params = new HttpParams();
    params = params.set('filter[only_mine]', String(onlyMine));
    params = params.set('filter[week_start]', weekStart);
    params = params.set('filter[week_end]', weekEnd);

    return this.http.get<{data: ScheduleEntry[]}>(`${this.apiUrl}/schedules/all`, {params});
  }
  
  updateSchedule(id: string, aulaData: any): Observable<{data: ScheduleEntry}> {
    return this.http.put<{data: ScheduleEntry}>(`${this.apiUrl}/schedules/${id}`, {aula: aulaData});
  }


  createScheduleException(originalId: string, exceptionDate: string, newAulaData: any): Observable<{data: ScheduleEntry}> {
    const payload = {
      ...newAulaData,
      exception_date: exceptionDate
    };
    return this.http.post<{data: ScheduleEntry}>(
      `${this.apiUrl}/schedules/${originalId}/exception`,
      {aula: payload}
    );
  }


  //Remove uma entrada de cronograma inteira (todas as ocorrências ou aula única)
  deleteSchedule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/schedules/${id}`);
  }

  //Remove apenas UMA ocorrência específica de uma aula recorrente
  deleteOccurrence(id: string, date: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/schedules/${id}/occurrence`, {
      params: {date: date}
    });
  }

  createDailylog(scheduleId: string, logData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedules/${scheduleId}/logs`, {log: logData});
  }

  //obter URL pré-assinada
  private getPresignedUrl(filename: string, fileType: string) {
    return this.http.get<{data: {upload_url: string, public_url: string}}>(`${this.apiUrl}/logs/upload_url`, {params: {filename, type: fileType}});
  }

  //Fazer upload para o S3 (PUT direto)
  private uploadToS3(uploadUrl: string, file: File) {
    return this.http.put(uploadUrl, file, {
      headers: {'Content-Type': file.type}
    });
  }

  //salvar metadados no Backend
  private registerAttachment(logId: string, fileUrl: string, fileType: string, fileName: string) {
    return this.http.post(`${this.apiUrl}/logs/${logId}/attachments`, {
      attachment: {file_url: fileUrl, file_type: fileType, file_name: fileName}
    });
  }

}
