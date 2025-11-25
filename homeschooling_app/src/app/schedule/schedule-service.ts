import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ScheduleEntry } from '../models/schedule-entry.model';
import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private apiUrl = environment.apiUrl;

  //Cliente HTTP especial que ignora interceptores (para chamadas externas como S3)
  private externalHttp: HttpClient;

  constructor(private http: HttpClient, private handler: HttpBackend) {
    //Criar uma nova instância de HttpClient usando o handler puro
    this.externalHttp = new HttpClient(handler);
  }

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
    return this.externalHttp.put(uploadUrl, file, {
      headers: {'Content-Type': file.type}
    });
  }

  //salvar metadados no Backend
  private registerAttachment(logId: string, fileUrl: string, fileType: string, fileName: string) {
    return this.http.post(`${this.apiUrl}/logs/${logId}/attachments`, {
      attachment: {file_url: fileUrl, file_type: fileType, file_name: fileName}
    });
  }

  //Recebe um objeto File (do input HTML), envia para o S3 e registra no backend.
  uploadfileFlow(file: File, logId: string): Observable<any> {
    const filename = file.name; //ex tarefa.pdf
    const filetype = file.type; //application/pdf

    //encadeia as chamadas: Pegar URL -> Enviar S3 -> Registrar no banco
    return this.getPresignedUrl(filename, filetype).pipe(
      switchMap(res => {
        const {upload_url, public_url} = res.data;
        //faz o upload e, quando terminar, retorna os dados para o próximo passo
        return this.uploadToS3(upload_url, file).pipe(
          switchMap(() => {
            return this.registerAttachment(logId, public_url, filetype, filename);
          })
        );
      })
    );
  }


  getAttachments(logId: string) {
    return this.http.get<{data: any[]}>(`${this.apiUrl}/logs/${logId}/attachments`);
  }

}
