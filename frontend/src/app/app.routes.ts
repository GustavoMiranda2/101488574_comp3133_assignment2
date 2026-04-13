//Name: Gustavo Miranda
//Student ID: 101488574

import { Routes } from '@angular/router';
import { sessionGateGuard } from './core/guards/session-gate-guard';
import { LoginLounge } from './features/auth/login-lounge/login-lounge';
import { SignupPortal } from './features/auth/signup-portal/signup-portal';
import { EmployeeRoster } from './features/employees/employee-roster/employee-roster';
import { EmployeeEditor } from './features/employees/employee-editor/employee-editor';
import { EmployeeProfile } from './features/employees/employee-profile/employee-profile';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    component: LoginLounge
  },
  {
    path: 'signup',
    component: SignupPortal
  },
  {
    path: 'employees',
    canActivate: [sessionGateGuard],
    component: EmployeeRoster
  },
  {
    path: 'employees/new',
    canActivate: [sessionGateGuard],
    component: EmployeeEditor
  },
  {
    path: 'employees/:id',
    canActivate: [sessionGateGuard],
    component: EmployeeProfile
  },
  {
    path: 'employees/:id/edit',
    canActivate: [sessionGateGuard],
    component: EmployeeEditor
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
