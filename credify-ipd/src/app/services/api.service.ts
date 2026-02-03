// src/app/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResumeInput, AssessmentResult, BatchResponse } from '../models/resume.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) { }

  /**
   * Check API health
   */
  checkHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  /**
   * Assess a single resume
   */
  assessResume(resume: ResumeInput): Observable<AssessmentResult> {
    return this.http.post<AssessmentResult>(`${this.baseUrl}/assess`, resume);
  }

  /**
   * Assess multiple resumes
   */
  assessBatch(resumes: ResumeInput[]): Observable<BatchResponse> {
    return this.http.post<BatchResponse>(`${this.baseUrl}/assess/batch`, { resumes });
  }

  /**
   * Get statistics
   */
  getStatistics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`);
  }
}