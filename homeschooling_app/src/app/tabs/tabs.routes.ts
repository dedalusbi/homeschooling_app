import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { authGuard } from '../auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'alunos',
        loadComponent: () =>
          import('./alunos/alunos.page').then((m) => m.AlunosPage),
      },
     
    ],
  },
  
];
