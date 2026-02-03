import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ResumeInput } from '../../models/resume.model';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card class="upload-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>upload_file</mat-icon>
          Upload Resume
        </mat-card-title>
        <mat-card-subtitle>
          Upload PDF, DOCX, or TXT file to auto-fill the form
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="upload-zone" 
             (click)="fileInput.click()"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             [class.dragging]="isDragging">
          
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          
          <p class="upload-text">
            <strong>Drop resume file here</strong> or click to browse
          </p>
          
          <p class="upload-hint">
            Supports: PDF, DOCX, TXT (Max 5MB)
          </p>

          <input #fileInput
                 type="file"
                 accept=".pdf,.doc,.docx,.txt"
                 (change)="onFileSelected($event)"
                 style="display: none">
        </div>

        <mat-progress-bar *ngIf="uploading" 
                         mode="indeterminate"
                         class="upload-progress">
        </mat-progress-bar>

        <div *ngIf="selectedFile" class="file-info">
          <mat-icon>description</mat-icon>
          <div class="file-details">
            <strong>{{ selectedFile.name }}</strong>
            <span>{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <button mat-icon-button (click)="clearFile()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="upload-actions" *ngIf="selectedFile">
          <button mat-raised-button 
                  color="primary" 
                  (click)="processFile()"
                  [disabled]="uploading">
            <mat-icon>auto_fix_high</mat-icon>
            Extract & Fill Form
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .upload-card {
      margin-bottom: 24px;
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
      transition: all 0.3s ease;
      background-color: #fafafa;
    }

    .upload-zone:hover {
      border-color: #1976d2;
      background-color: #f0f7ff;
    }

    .upload-zone.dragging {
      border-color: #1976d2;
      background-color: #e3f2fd;
      transform: scale(1.02);
    }

    .upload-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #1976d2;
      margin: 0 auto 16px;
    }

    .upload-text {
      margin: 16px 0 8px;
      color: #424242;
      font-size: 16px;
    }

    .upload-hint {
      margin: 0;
      color: #666;
      font-size: 13px;
    }

    .upload-progress {
      margin-top: 16px;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background-color: #e3f2fd;
      border-radius: 8px;
      margin-top: 16px;
    }

    .file-info mat-icon {
      color: #1976d2;
    }

    .file-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .file-details strong {
      color: #424242;
      font-size: 14px;
    }

    .file-details span {
      color: #666;
      font-size: 12px;
    }

    .upload-actions {
      margin-top: 16px;
      display: flex;
      justify-content: center;
    }

    .upload-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class FileUploadComponent {
  @Output() resumeExtracted = new EventEmitter<ResumeInput>();

  selectedFile: File | null = null;
  uploading = false;
  isDragging = false;

  constructor(private snackBar: MatSnackBar) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File) {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.snackBar.open('Unsupported file type. Please upload PDF, DOCX, or TXT.', 'Close', {
        duration: 3000
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('File too large. Maximum size is 5MB.', 'Close', {
        duration: 3000
      });
      return;
    }

    this.selectedFile = file;
  }

  processFile() {
    if (!this.selectedFile) return;

    this.uploading = true;

    // Simulate file processing (in real app, this would call backend API)
    setTimeout(() => {
      // Extract mock data from filename
      const extractedData: ResumeInput = {
        name: this.extractNameFromFile(),
        skills: 'Python, Django, PostgreSQL, Docker, AWS',
        experience: 'Extracted from resume file. Software Engineer with experience in backend development.',
        education: 'BSc Computer Science, 2021',
        projects: 'Various projects extracted from resume'
      };

      this.uploading = false;
      this.resumeExtracted.emit(extractedData);
      
      this.snackBar.open('Resume extracted successfully!', 'Close', {
        duration: 3000
      });
    }, 2000);
  }

  extractNameFromFile(): string {
    if (!this.selectedFile) return 'Unknown';
    
    // Try to extract name from filename
    const filename = this.selectedFile.name.replace(/\.[^/.]+$/, '');
    const words = filename.split(/[-_\s]/);
    
    if (words.length >= 2) {
      return words.slice(0, 2).map(w => 
        w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      ).join(' ');
    }
    
    return filename;
  }

  clearFile() {
    this.selectedFile = null;
    this.uploading = false;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}