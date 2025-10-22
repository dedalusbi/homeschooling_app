import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  //URL da API definida nos arquivos environment
  private apiUrl = environment.apiUrl

  constructor(private http: HttpClient) {

  }

  register(fullName: string, email: string, password: string) {
    const userData = {
      user: {
        full_name: fullName,
        email: email,
        password: password
      }
    };
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }


  login(email: string, password: string) {
    const credentials = {
      user: {
        email: email, 
        password: password
      }
    };

    return this.http.post<{token: string}>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap(response => {
        //!! !AQUI É ONDE ARMAZENAMOS O TOKEN !!
        //implementar lógica de armazenamento seguro (ex.: Ionic Storage)
        console.log('Token para armazenar: ', response.token);
      })
    );
  }


  
}
