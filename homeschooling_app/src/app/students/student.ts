import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


//Defininfo uma interdade para os dados do aluno
export interface Student {
  id?: string;
  name: string;
  birth_date?: string |null; //formato YYYY-MM-DD
  grade_level?: string | null;
  individualities?: any; //jsonb

}



@Injectable({
  providedIn: 'root'
})
export class Student {

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


}
