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
      {
        path: 'forgot-password', //Rota completa: /auth/forgot-password
        loadComponent: () => import('./auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
      },
      {
        path: 'reset-password', //Rota completa: /auth/reset-password
        loadComponent: () => import('./auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage),
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./auth/verify-email/verify-email.page').then(m => m.VerifyEmailPage),
      },
      { //Redireciona /auth para /auth/welcome se alguém digitar só /auth
        path: '',
        redirectTo: 'welcome',
        pathMatch: 'full',
      }
    ]

  },
  {
    path: 'manage-subjects/:student_id',
    loadComponent: () => import('./students/manage-subjects/manage-subjects.page').then(m => m.ManageSubjectsPage),
    canActivate: [authGuard]
  },
  {
    path: 'subject-form/:student_id',
    loadComponent: () => import('./students/subject-form/subject-form.page').then(m => m.SubjectFormPage),
    canActivate: [authGuard]
  },
  {
    path: 'subject-details/:id',
    loadComponent: () => import('./students/subject-details/subject-details.page').then(m => m.SubjectDetailsPage),
    canActivate: [authGuard]
  },
  //{
  //  path: 'subject-details/:id/edit',
  //  loadComponent: () => import('./students/subject-form/subject-form.page').then(m => m.SubjectFormPage),
  //  canActivate: [authGuard]
  //},

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
  },
  {
    path: 'manage-subjects',
    loadComponent: () => import('./students/manage-subjects/manage-subjects.page').then( m => m.ManageSubjectsPage)
  },
  {
    path: 'subject-form',
    loadComponent: () => import('./students/subject-form/subject-form.page').then( m => m.SubjectFormPage)
  },
  {
    path: 'subject-details',
    loadComponent: () => import('./students/subject-details/subject-details.page').then( m => m.SubjectDetailsPage)
  },
  
  


];
