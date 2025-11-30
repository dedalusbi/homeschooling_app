import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import {Student} from '../models/student.model';
import { Subject } from '../models/subject.model';
import { Assessment } from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = environment.apiUrl;
  //Cliente HTTP especial que ignora interceptores (para chamadas externas como S3)
  private externalHttp: HttpClient;
  constructor(private http: HttpClient,  private handler: HttpBackend){
    this.externalHttp = new HttpClient(handler);
  }
  

  //Cria um novo aluno para o usuário logado
  createStudent(studentData: Partial<Student>): Observable<{data: Student}> {
    //O token JWT será adicionado automaticamente pelo Interceptor
    return this.http.post<{data: Student}>(`${this.apiUrl}/students`, {student: studentData});
  }

  // Busca a lista de alunos do usuário logado
  getStudents(): Observable<{data: Student[]}> {
    return this.http.get<{data: Student[]}>(`${this.apiUrl}/students`);
  }


  getStudentById(id: string): Observable<{data: Student}> {
    return this.http.get<{data: Student }>(`${this.apiUrl}/students/${id}`);
  }

  updateStudent(id: string, studentData: Partial<Student>): Observable<{data: Student}> {
    return this.http.put<{data: Student}>(`${this.apiUrl}/students/${id}`, {student: studentData});
  }

  deleteStudent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/students/${id}`);
  }

  // Busca a lista de matérias de um aluno específico, filtrada por status
  getSubjects(studentId: string, status: 'active' | 'completed' | 'all' = 'active'): Observable<{data: Subject[]}> {
    //Constrói os parâmetros de query
    const params = new HttpParams().set('filter[status]', status);

    return this.http.get<{data: Subject[]}>(`${this.apiUrl}/students/${studentId}/subjects`, {params: params});

  }


  createSubject(studentId: string, subjectData: Partial<Subject>): Observable<{data: Subject}> {
    return this.http.post<{data:Subject}>(`${this.apiUrl}/students/${studentId}/subjects`,
      {subject: subjectData}
    );
  }


  getSubjectById(subjectId: string): Observable<{data: Subject}> {
    return this.http.get<{data:Subject}>(`${this.apiUrl}/subjects/${subjectId}`);
  }


  updateSubject(subjectId: string, subjectData: Partial<Subject>): Observable<{data: Subject}> {
    return this.http.put<{data:Subject}>(`${this.apiUrl}/subjects/${subjectId}`,
      {subject: subjectData}
    );
  }

  completeSubject(subjectId: string, reportData: {final_report: string}): Observable<{data: Subject}> {
    return this.http.post<{data:Subject}>(`${this.apiUrl}/subjects/${subjectId}/complete`,
      {report: reportData}
    );
  }

  reactivateSubject(subjectId: string): Observable<{data: Subject}> {
    return this.http.post<{data:Subject}>(`${this.apiUrl}/subjects/${subjectId}/reactivate`, {});
  }

  deleteSubject(subjectId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/subjects/${subjectId}`);
  }


  getDashboardStats() {
    return this.http.get<{data:{active_students: number, average_progress: number}}>(`${this.apiUrl}/dashboard/stats`);
  }

  createAssessment(subjectId: string, assessmentData: any): Observable<{data: Assessment}> {
    return this.http.post<{data: Assessment}>(
      `${this.apiUrl}/subjects/${subjectId}/assessments`, {
        assessment: assessmentData
      }
    );  
  }

  
  getAssessmentPresignedUrl(filename: string, fileType: string) {
    return this.http.get<{data: {upload_url: string, public_url: string}}>(`${this.apiUrl}/assessments/upload_url`, {params: {filename, type: fileType}});
  }

  //Fazer upload para o S3 (PUT direto)
  private uploadToS3(uploadUrl: string, file: File) {
    return this.externalHttp.put(uploadUrl, file, {
      headers: {'Content-Type': file.type}
    });
  }

  registerAssessmentAttachment(assessmentId: string, fileUrl: string, fileType: string, fileName: string) {
    return this.http.post(`${this.apiUrl}/assessments/${assessmentId}/attachments`, {
      attachment: {file_url: fileUrl, file_type: fileType, file_name: fileName}
    });
  }

  uploadAssessmentFileFlow(file: File, assessmentId: string): Observable<any> {
      const filename = file.name; //ex tarefa.pdf
      const filetype = file.type; //application/pdf
  
      //encadeia as chamadas: Pegar URL -> Enviar S3 -> Registrar no banco
      return this.getAssessmentPresignedUrl(filename, filetype).pipe(
        switchMap(res => {
          const {upload_url, public_url} = res.data;
          //faz o upload e, quando terminar, retorna os dados para o próximo passo
          return this.uploadToS3(upload_url, file).pipe(
            switchMap(() => {
              return this.registerAssessmentAttachment(assessmentId, public_url, filetype, filename);
            })
          );
        })
      );
    }

  updateAssessment(assessmentId: string, assessmentData: any): Observable<{ data: Assessment }> {
    // Envia um PUT para /api/assessments/:id
    return this.http.put<{ data: Assessment }>(
      `${this.apiUrl}/assessments/${assessmentId}`,
      { assessment: assessmentData }
    );
  }

  deleteAssessment(assessmentId: string): Observable<void> {
    // Envia um DELETE para /api/assessments/:id
    return this.http.delete<void>(`${this.apiUrl}/assessments/${assessmentId}`);
  }
}
