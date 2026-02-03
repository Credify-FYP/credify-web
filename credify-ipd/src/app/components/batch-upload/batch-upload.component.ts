import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { ResumeInput, BatchResponse } from '../../models/resume.model';

@Component({
  selector: 'app-batch-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="batch-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <mat-icon>upload_file</mat-icon>
            Batch Assessment
          </mat-card-title>
          <mat-card-subtitle>
            Upload CSV file to assess multiple resumes at once
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Upload Section -->
          <div class="upload-section" *ngIf="!results">
            <div class="upload-zone" (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon>
              <p><strong>Upload CSV File</strong></p>
              <p class="hint">CSV must have columns: name, skills, experience, education, projects</p>
              <input #fileInput
                     type="file"
                     accept=".csv"
                     (change)="onFileSelected($event)"
                     style="display: none">
            </div>

            <div *ngIf="selectedFile" class="file-selected">
              <mat-icon>description</mat-icon>
              <span>{{ selectedFile.name }}</span>
              <button mat-icon-button (click)="clearFile()">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <button mat-raised-button 
                    color="primary" 
                    *ngIf="selectedFile"
                    (click)="processBatch()"
                    [disabled]="processing">
              <mat-icon>assessment</mat-icon>
              Assess All Resumes
            </button>

            <mat-progress-bar *ngIf="processing" 
                             mode="indeterminate">
            </mat-progress-bar>

            <!-- Sample CSV Template -->
            <div class="template-section">
              <h3>Need a template?</h3>
              <button mat-stroked-button (click)="downloadTemplate()">
                <mat-icon>download</mat-icon>
                Download CSV Template
              </button>
            </div>
          </div>

          <!-- Results Section -->
          <div class="results-section" *ngIf="results">
            <div class="summary-cards">
              <mat-card class="summary-card credible">
                <mat-icon>check_circle</mat-icon>
                <div class="summary-content">
                  <span class="summary-value">{{ results.summary.credible }}</span>
                  <span class="summary-label">Credible</span>
                </div>
              </mat-card>

              <mat-card class="summary-card suspicious">
                <mat-icon>warning</mat-icon>
                <div class="summary-content">
                  <span class="summary-value">{{ results.summary.suspicious }}</span>
                  <span class="summary-label">Suspicious</span>
                </div>
              </mat-card>

              <mat-card class="summary-card false">
                <mat-icon>cancel</mat-icon>
                <div class="summary-content">
                  <span class="summary-value">{{ results.summary.false }}</span>
                  <span class="summary-label">False</span>
                </div>
              </mat-card>
            </div>

            <!-- Results Table -->
            <table mat-table [dataSource]="results.results" class="results-table">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let result">{{ result.name }}</td>
              </ng-container>

              <ng-container matColumnDef="score">
                <th mat-header-cell *matHeaderCellDef>Score</th>
                <td mat-cell *matCellDef="let result">
                  <strong>{{ result.credibility_score.toFixed(1) }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="label">
                <th mat-header-cell *matHeaderCellDef>Label</th>
                <td mat-cell *matCellDef="let result">
                  <mat-chip [class]="result.credibility_label.toLowerCase()">
                    {{ result.credibility_label }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="confidence">
                <th mat-header-cell *matHeaderCellDef>Confidence</th>
                <td mat-cell *matCellDef="let result">{{ result.confidence }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <div class="action-buttons">
              <button mat-raised-button (click)="downloadResults()">
                <mat-icon>download</mat-icon>
                Export Results (CSV)
              </button>
              <button mat-raised-button (click)="reset()">
                <mat-icon>refresh</mat-icon>
                Assess New Batch
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .batch-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .upload-zone {
      border: 2px dashed #ccc;
      border-radius: 12px;
      padding: 48px 24px;
      text-align: center;
      cursor: pointer;
      margin-bottom: 24px;
    }

    .upload-zone:hover {
      border-color: #1976d2;
      background-color: #f0f7ff;
    }

    .upload-zone mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #1976d2;
    }

    .file-selected {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .template-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
    }

    .template-section h3 {
      color: #424242;
      margin-bottom: 16px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px !important;
    }

    .summary-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .summary-card.credible { border-left: 4px solid #4caf50; }
    .summary-card.credible mat-icon { color: #4caf50; }

    .summary-card.suspicious { border-left: 4px solid #ff9800; }
    .summary-card.suspicious mat-icon { color: #ff9800; }

    .summary-card.false { border-left: 4px solid #f44336; }
    .summary-card.false mat-icon { color: #f44336; }

    .summary-content {
      display: flex;
      flex-direction: column;
    }

    .summary-value {
      font-size: 28px;
      font-weight: 700;
      color: #424242;
    }

    .summary-label {
      font-size: 14px;
      color: #666;
    }

    .results-table {
      width: 100%;
      margin: 24px 0;
    }

    mat-chip.credible {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    mat-chip.suspicious {
      background-color: #fff3e0 !important;
      color: #ef6c00 !important;
    }

    mat-chip.false {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 24px;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class BatchUploadComponent {
  selectedFile: File | null = null;
  processing = false;
  results: BatchResponse | null = null;
  displayedColumns = ['name', 'score', 'label', 'confidence'];

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  clearFile() {
    this.selectedFile = null;
  }

  processBatch() {
    if (!this.selectedFile) return;

    this.processing = true;

    // Parse CSV and create resume array
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const resumes = this.parseCSV(text);

      if (resumes.length === 0) {
        this.snackBar.open('No valid resumes found in CSV', 'Close', { duration: 3000 });
        this.processing = false;
        return;
      }

      // Send to API
      this.apiService.assessBatch(resumes).subscribe({
        next: (response) => {
          this.results = response;
          this.processing = false;
          this.snackBar.open(`Assessed ${response.total_assessed} resumes!`, 'Close', {
            duration: 3000
          });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Batch assessment failed', 'Close', { duration: 3000 });
          this.processing = false;
        }
      });
    };

    reader.readAsText(this.selectedFile);
  }

  parseCSV(text: string): ResumeInput[] {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const resumes: ResumeInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim());
      const resume: ResumeInput = {
        name: values[headers.indexOf('name')] || 'Unknown',
        skills: values[headers.indexOf('skills')] || '',
        experience: values[headers.indexOf('experience')] || '',
        education: values[headers.indexOf('education')] || '',
        projects: values[headers.indexOf('projects')] || ''
      };

      if (resume.name && resume.skills && resume.experience) {
        resumes.push(resume);
      }
    }

    return resumes;
  }

  downloadTemplate() {
    const csv = 'name,skills,experience,education,projects\n' +
                'John Doe,"Python, Java, SQL","Senior Developer at TechCorp (2020-2024)","BSc CS 2020","Built microservices"\n' +
                'Jane Smith,"JavaScript, React","Frontend Developer (2021-2024)","BSc IT 2021","Created dashboards"';

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'credify_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadResults() {
    if (!this.results) return;

    let csv = 'name,credibility_score,label,confidence,evidence,timeline,complexity,anomaly\n';
    
    this.results.results.forEach(r => {
      csv += `"${r.name}",${r.credibility_score},"${r.credibility_label}","${r.confidence}",`;
      csv += `"${r.details.evidence}","${r.details.timeline}","${r.details.complexity}","${r.details.anomaly}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credify_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  reset() {
    this.selectedFile = null;
    this.results = null;
    this.processing = false;
  }
}