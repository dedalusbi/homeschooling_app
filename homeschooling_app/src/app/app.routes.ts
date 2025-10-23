import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
  
  {
    path: '',
    redirectTo: 'auth/welcome', //Rota inicial aponta para a tela de boas-vindas
    pathMatch: 'full'
  },
  
  {

    path: 'auth', //Rota 'pai' para agrupar
    children: [
      {
        path: 'welcome', //Rota completa: /auth/welcome
        loadComponent: () => import('./auth/welcome/welcome.page').then(m => m.WelcomePage),
      },
      {
        path: 'register', //Rota completa: /auth/register
        loadComponent: () => import('./auth/register/register.page').then(m => m.RegisterPage),
      },
      {
        path: 'login', //Rota completa: /auth/login
        loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage),
      },
      { //Redireciona /auth para /auth/welcome se alguém digitar só /auth
        path: '',
        redirectTo: 'welcome',
        pathMatch: 'full',
      }
    ]

  },


  //Outras rotas principais (ex.: tabs)
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
    canActivate: [authGuard] //qualquer tentativa de ir para /tabs/... passará pelo guard.
  },

  //Rota de fallback
  {
    path: '**',
    redirectTo: 'auth/welcome'
  }



];
