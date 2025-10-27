import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, Observable, take, filter, switchMap } from 'rxjs';
import { Auth } from './auth';


//AuthGuard funcional. Verifica se o usuário está autenticado antes de permitir acesso a uma rota.
//@returns True se o usuário pode ativar a rota, ou uma UrlTree para redirecionar para o login.

export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {

    console.log("Função authGuard está sendo execuddtada.");
    // Injetar as dependências necessárias DENTRO da função do guard.
    // Não podemos usar 'constructor' como numa classe.
    const authService = inject(Auth);
    const router = inject(Router);

    // Subscreve ao Observable $isAuthenticated do AuthService.
    // Este Observable nos diz em tempo real se o estado é 'logado' (true) ou 'não logado' (false)
    return authService.$isAuthenticated.pipe(
      filter(isDone => isDone === true),
      switchMap(() => authService.$isAuthenticated),
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          console.log('AuthGuard: Acesso permitido.');
          return true;
        } else {
          console.log('AuthGuard: Acesso negado. Redirecionando para /auth/login...');
          return router.createUrlTree(['/auth/login']);
        }
      })
    );

  };