import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../services/api.service';
import { ResumeInput, AssessmentResult } from '../../models/resume.model';
import { ResultsDisplayComponent } from '../results-display/results-display.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule,
    ResultsDisplayComponent,
    FileUploadComponent
  ],
  template: `
    <div class="assessment-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>assignment</mat-icon>
            Resume Assessment
          </mat-card-title>
          <mat-card-subtitle>
            Enter resume details manually or upload a file
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <mat-tab-group>
            <!-- Manual Entry Tab -->
            <mat-tab label="Manual Entry">
              <div class="tab-content">
                <form #assessmentForm="ngForm" (ngSubmit)="onSubmit()">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Candidate Name</mat-label>
                    <input matInput 
                           [(ngModel)]="resume.name" 
                           name="name"
                           placeholder="e.g., John Doe"
                           required>
                    <mat-icon matPrefix>person</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Skills (comma-separated)</mat-label>
                    <input matInput 
                           [(ngModel)]="resume.skills" 
                           name="skills"
                           placeholder="e.g., Python, Java, React, SQL, AWS"
                           required>
                    <mat-icon matPrefix>code</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Work Experience</mat-label>
                    <textarea matInput 
                              [(ngModel)]="resume.experience" 
                              name="experience"
                              rows="4"
                              placeholder="Describe work experience, roles, and responsibilities..."
                              required></textarea>
                    <mat-icon matPrefix>work</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Education</mat-label>
                    <input matInput 
                           [(ngModel)]="resume.education" 
                           name="education"
                           placeholder="e.g., BSc Computer Science, IIT, 2020"
                           required>
                    <mat-icon matPrefix>school</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Projects (Optional)</mat-label>
                    <textarea matInput 
                              [(ngModel)]="resume.projects" 
                              name="projects"
                              rows="3"
                              placeholder="Describe key projects..."></textarea>
                    <mat-icon matPrefix>folder</mat-icon>
                  </mat-form-field>

                  <div class="form-actions">
                    <button mat-raised-button 
                            type="button" 
                            (click)="loadSampleData()"
                            [disabled]="loading">
                      <mat-icon>style</mat-icon>
                      Load Sample
                    </button>
                    
                    <button mat-raised-button 
                            type="button" 
                            (click)="clearForm()"
                            [disabled]="loading">
                      <mat-icon>clear</mat-icon>
                      Clear
                    </button>

                    <button mat-raised-button 
                            color="primary" 
                            type="submit"
                            [disabled]="!assessmentForm.valid || loading">
                      <mat-icon *ngIf="!loading">send</mat-icon>
                      <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                      {{ loading ? 'Assessing...' : 'Assess Resume' }}
                    </button>
                  </div>
                </form>
              </div>
            </mat-tab>

            <!-- File Upload Tab -->
            <mat-tab label="Upload File">
              <div class="tab-content">
                <app-file-upload 
                  (resumeExtracted)="onResumeExtracted($event)">
                </app-file-upload>

                <!-- Show form with extracted data -->
                <div *ngIf="resume.name" class="extracted-data">
                  <h3>
                    <mat-icon>check_circle</mat-icon>
                    Extracted Data - Review & Submit
                  </h3>

                  <div class="data-preview">
                    <div class="preview-item">
                      <strong>Name:</strong>
                      <span>{{ resume.name }}</span>
                    </div>
                    <div class="preview-item">
                      <strong>Skills:</strong>
                      <span>{{ resume.skills }}</span>
                    </div>
                    <div class="preview-item">
                      <strong>Experience:</strong>
                      <span>{{ resume.experience }}</span>
                    </div>
                    <div class="preview-item">
                      <strong>Education:</strong>
                      <span>{{ resume.education }}</span>
                    </div>
                  </div>

                  <div class="form-actions">
                    <button mat-raised-button 
                            color="primary" 
                            (click)="onSubmit()"
                            [disabled]="loading">
                      <mat-icon *ngIf="!loading">send</mat-icon>
                      <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                      {{ loading ? 'Assessing...' : 'Assess This Resume' }}
                    </button>
                  </div>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>

      <!-- Results Section -->
      <app-results-display 
        *ngIf="result" 
        [result]="result">
      </app-results-display>

      <!-- Error Message -->
      <mat-card *ngIf="error" class="error-card">
        <mat-card-content>
          <div class="error-message">
            <mat-icon>error</mat-icon>
            <span>{{ error }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .assessment-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px;
    }

    .form-card {
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 20px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 600;
    }

    .tab-content {
      padding: 24px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .extracted-data {
      margin-top: 24px;
      padding: 24px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .extracted-data h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .data-preview {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .preview-item {
      display: flex;
      gap: 8px;
    }

    .preview-item strong {
      min-width: 100px;
      color: #424242;
    }

    .preview-item span {
      color: #666;
      flex: 1;
    }

    .error-card {
      background-color: #ffebee;
      border-left: 4px solid #f44336;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #c62828;
    }

    .error-message mat-icon {
      color: #f44336;
    }
  `]
})
export class AssessmentFormComponent {
  resume: ResumeInput = {
    name: '',
    skills: '',
    experience: '',
    education: '',
    projects: ''
  };

  result: AssessmentResult | null = null;
  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  onSubmit() {
    this.loading = true;
    this.error = null;
    this.result = null;

    this.apiService.assessResume(this.resume).subscribe({
      next: (response) => {
        this.result = response;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to assess resume. Please check if the backend is running.';
        this.loading = false;
        console.error('Assessment error:', err);
      }
    });
  }

  onResumeExtracted(extractedResume: ResumeInput) {
    this.resume = extractedResume;
  }

  loadSampleData() {
    this.resume = {
      name: 'Alice Johnson',
      skills: 'Python, Django, PostgreSQL, Docker, AWS',
      experience: 'Software Engineer at DataCorp (2021-2024). Developed REST APIs using Django and PostgreSQL. Containerized applications with Docker. Deployed on AWS EC2. Led migration of legacy system to microservices.',
      education: 'BSc Computer Science, IIT, graduated 2021',
      projects: 'Built inventory management system handling 1000+ products. Implemented real-time data synchronization. Created automated deployment pipeline.'
    };
  }

  clearForm() {
    this.resume = {
      name: '',
      skills: '',
      experience: '',
      education: '',
      projects: ''
    };
    this.result = null;
    this.error = null;
  }
}