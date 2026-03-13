import { Routes } from '@angular/router';

import { CrudPageComponent } from './pages/crud-page.component';
import { AgendamentosPageComponent } from './pages/agendamentos-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'clinicas' },
  { path: 'clinicas', component: CrudPageComponent, data: { entity: 'clinicas' } },
  { path: 'medicos', component: CrudPageComponent, data: { entity: 'medicos' } },
  { path: 'pacientes', component: CrudPageComponent, data: { entity: 'pacientes' } },
  { path: 'agendamentos', component: AgendamentosPageComponent },
  { path: 'dashboard', component: DashboardPageComponent },
];
