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
        path: 'planejamento',
        children: [
          {
            //Rota principal de planejamento
            path: '',
            loadComponent:() => import('./planejamento/planejamento.page').then((m) => m.PlanejamentoPage),
          }
        ]
      },
      {
        path: 'subjects',
        loadComponent:() => import('../students/manage-subjects/manage-subjects.page').then(m => m.ManageSubjectsPage),
      },
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
  {
    path: 'planejamento',
    loadComponent: () => import('./planejamento/planejamento.page').then( m => m.PlanejamentoPage)
  },
  
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  }
  
];
