import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'assess', component: AssessmentFormComponent },
  { path: '**', redirectTo: '' }
];