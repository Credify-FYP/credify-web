import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ResumeInput,
  AssessmentResult,
  BatchResponse,
} from '../models/resume.model';

export interface PdfExtractResult {
  skills: string;
  experience: string;
  education: string;
  projects: string;
  filename: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  checkHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  assessResume(resume: ResumeInput): Observable<AssessmentResult> {
    return this.http.post<AssessmentResult>(`${this.baseUrl}/assess`, resume);
  }

  assessBatch(resumes: ResumeInput[]): Observable<BatchResponse> {
    return this.http.post<BatchResponse>(`${this.baseUrl}/assess/batch`, {
      resumes,
    });
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`);
  }

  getModelInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/model-info`);
  }

  extractPdf(formData: FormData): Observable<PdfExtractResult> {
    return this.http.post<PdfExtractResult>(
      `${this.baseUrl}/extract-pdf`,
      formData,
    );
  }

  downloadReport(assessment: any, resume: any): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/report`,
      { assessment, resume },
      { responseType: 'blob' },
    );
  }
}
