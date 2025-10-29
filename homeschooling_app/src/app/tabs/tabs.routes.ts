import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    canActivate: [authGuard],
    children: [
      {
        path: 'alunos',
        children: [
          {
            //Rota principal de alunos
            path: '',
             loadComponent: () => import('./alunos/alunos.page').then((m) => m.AlunosPage),
          },
          {
            path: 'student-form',
            loadComponent: () => import('../students/student-form/student-form.page').then( m => m.StudentFormPage),
        
          },

          {
            path: 'student-form/:id',
            loadComponent: () => import('../students/student-form/student-form.page').then( m => m.StudentFormPage),
        
          },
          {
            path: 'student-details/:id',
            loadComponent: () => import('../students/student-details/student-details.page').then( m => m.StudentDetailsPage),
      
          },
        ]
       
      },  
    ],
  },
  
];
