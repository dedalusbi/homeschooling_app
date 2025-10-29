import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {Student} from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient){}
  

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

}
