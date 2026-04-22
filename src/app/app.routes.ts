import { Routes } from '@angular/router';
import { DashboardComponent }     from './components/dashboard/dashboard.component';
import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';
import { BatchUploadComponent }    from './components/batch-upload/batch-upload.component';

export const routes: Routes = [
  { path: '',        redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'assess',    component: AssessmentFormComponent },
  { path: 'batch',     component: BatchUploadComponent },
  { path: '**',        redirectTo: 'dashboard' },
];