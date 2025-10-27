import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { Auth } from '../auth/auth';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {


  constructor(private authService: Auth)  {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //Converte a Promise do getToken() num Observable temporário
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          const clonedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          //Passa a requisição clonada para o próximo handler
          return next.handle(clonedReq);
        } else {
          //Se não houver token, passa a requisição original adiante
          return next.handle(req);
        }
      })
    );
  }
  


}