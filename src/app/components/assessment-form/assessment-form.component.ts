import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ResumeInput, AssessmentResult } from '../../models/resume.model';

declare const pdfjsLib: any;

type TabType = 'text' | 'upload';
type UploadState = 'idle' | 'loading' | 'done' | 'error';

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="assess-page">
      <div class="page-header fade-in-up">
        <div class="section-label">SINGLE ASSESSMENT</div>
        <h1 class="page-title">Assess a Resume</h1>
        <p class="page-sub">
          Upload a PDF or paste resume text. The ML model analyses all four MSCA
          signals.
        </p>
      </div>

      <div class="assess-layout">
        <!-- ── LEFT FORM ──────────────────────────────────── -->
        <div class="form-col fade-in-up" style="animation-delay:0.1s">
          <!-- Tabs -->
          <div class="tab-bar">
            <button
              class="tab-btn"
              [class.active]="tab === 'text'"
              (click)="tab = 'text'"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Type / Paste
            </button>
            <button
              class="tab-btn"
              [class.active]="tab === 'upload'"
              (click)="tab = 'upload'"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload PDF
            </button>
          </div>

          <!-- ── UPLOAD TAB ──────────────────────────────── -->
          <div *ngIf="tab === 'upload'">
            <!-- Drop zone -->
            <div
              class="upload-zone"
              [class.drag-over]="isDragging"
              [class.has-file]="uploadState === 'done'"
              [class.loading]="uploadState === 'loading'"
              (dragover)="onDragOver($event)"
              (dragleave)="isDragging = false"
              (drop)="onDrop($event)"
              (click)="uploadState === 'idle' && fileInput.click()"
            >
              <input
                #fileInput
                type="file"
                accept=".pdf,.txt"
                style="display:none"
                (change)="onFileSelect($event)"
              />

              <!-- IDLE -->
              <div *ngIf="uploadState === 'idle'" class="dz-idle">
                <div class="dz-icon">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p class="dz-title">Drop your PDF or .txt resume</p>
                <p class="dz-sub">Click to browse · PDF or plain text</p>
              </div>

              <!-- LOADING -->
              <div *ngIf="uploadState === 'loading'" class="dz-loading">
                <div class="dz-spin"></div>
                <p class="dz-loading-text">Extracting text from PDF...</p>
              </div>

              <!-- DONE -->
              <div
                *ngIf="uploadState === 'done'"
                class="dz-done"
                (click)="$event.stopPropagation()"
              >
                <div class="dz-done-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div class="dz-done-text">
                  <p class="dz-fname">{{ uploadedFileName }}</p>
                  <p class="dz-fmeta">
                    Text extracted — review fields below then click Assess
                  </p>
                </div>
                <button class="rm-file-btn" (click)="resetUpload()">✕</button>
              </div>

              <!-- ERROR -->
              <div
                *ngIf="uploadState === 'error'"
                class="dz-error"
                (click)="$event.stopPropagation()"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <div>
                  <p class="dz-err-title">Extraction failed</p>
                  <p class="dz-err-msg">{{ uploadError }}</p>
                </div>
                <button class="rm-file-btn" (click)="resetUpload()">
                  Try again
                </button>
              </div>
            </div>

            <!-- EXTRACTED fields — shown after successful extraction -->
            <div *ngIf="uploadState === 'done'" class="extracted-section">
              <div class="extracted-banner">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Fields extracted from your PDF.
                <strong>Review and edit if needed</strong> before assessing.
              </div>

              <div class="field-group">
                <label class="field-label">Skills</label>
                <textarea
                  class="cf-textarea"
                  rows="3"
                  [(ngModel)]="resume.skills"
                ></textarea>
              </div>
              <div class="field-group">
                <label class="field-label">Work Experience</label>
                <textarea
                  class="cf-textarea"
                  rows="6"
                  [(ngModel)]="resume.experience"
                ></textarea>
              </div>
              <div class="field-group">
                <label class="field-label">Education</label>
                <textarea
                  class="cf-textarea"
                  rows="2"
                  [(ngModel)]="resume.education"
                ></textarea>
              </div>
              <div class="field-group">
                <label class="field-label">Projects</label>
                <textarea
                  class="cf-textarea"
                  rows="3"
                  [(ngModel)]="resume.projects"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- ── TEXT/PASTE TAB ──────────────────────────── -->
          <div class="text-fields" *ngIf="tab === 'text'">
            <div class="field-group">
              <label class="field-label">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Skills <span class="req">*</span>
              </label>
              <textarea
                class="cf-textarea"
                rows="3"
                [(ngModel)]="resume.skills"
                placeholder="Python, Django, PostgreSQL, Docker, REST APIs, Git, AWS"
              ></textarea>
            </div>
            <div class="field-group">
              <label class="field-label">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Work Experience <span class="req">*</span>
              </label>
              <textarea
                class="cf-textarea"
                rows="5"
                [(ngModel)]="resume.experience"
                placeholder="Software Engineer at TCS (Jan 2022 – Present). Developed microservices..."
              ></textarea>
            </div>
            <div class="field-group">
              <label class="field-label">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
                Education <span class="req">*</span>
              </label>
              <textarea
                class="cf-textarea"
                rows="2"
                [(ngModel)]="resume.education"
                placeholder="B.Tech. Computer Science, VIT University (2018–2022) | GPA 3.7/4.0"
              ></textarea>
            </div>
            <div class="field-group">
              <label class="field-label">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Projects <span class="optional">(optional)</span>
              </label>
              <textarea
                class="cf-textarea"
                rows="2"
                [(ngModel)]="resume.projects"
                placeholder="Python/React Dashboard: Real-time analytics. 20K users. 98% uptime."
              ></textarea>
            </div>
          </div>

          <!-- Sample buttons -->
          <div class="sample-row">
            <span class="sample-label">Load sample:</span>
            <button
              class="sample-btn credible"
              (click)="loadSample('credible')"
            >
              ✓ Credible
            </button>
            <button
              class="sample-btn suspicious"
              (click)="loadSample('suspicious')"
            >
              ⚠ Suspicious
            </button>
            <button class="sample-btn false" (click)="loadSample('false')">
              ✕ False
            </button>
          </div>

          <!-- Validation error -->
          <div class="error-msg" *ngIf="error">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {{ error }}
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button class="ghost-btn" (click)="clearForm()">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear
            </button>
            <button
              class="orange-btn assess-btn"
              (click)="assess()"
              [disabled]="loading || uploadState === 'loading'"
            >
              <span class="spinner" *ngIf="loading"></span>
              <svg
                *ngIf="!loading"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {{ loading ? 'Analysing...' : 'Assess Resume' }}
            </button>
          </div>
        </div>

        <!-- ── RIGHT RESULTS ────────────────────────────── -->
        <div class="results-col">
          <div class="empty-state" *ngIf="!result && !loading">
            <div class="empty-icon">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <p class="empty-title">No assessment yet</p>
            <p class="empty-sub">
              Upload a PDF or paste resume text, then click Assess Resume
            </p>
          </div>

          <div class="skeleton-wrap" *ngIf="loading">
            <div class="sk-hero"></div>
            <div class="sk-bars">
              <div class="sk-bar" style="width:100%"></div>
              <div class="sk-bar" style="width:76%"></div>
              <div class="sk-bar" style="width:54%"></div>
            </div>
            <div class="sk-grid">
              <div class="sk-card"></div>
              <div class="sk-card"></div>
              <div class="sk-card"></div>
              <div class="sk-card"></div>
            </div>
          </div>

          <div class="result-wrap fade-in-up" *ngIf="result && !loading">
            <div
              class="verdict-card"
              [ngClass]="result.credibility_label.toLowerCase()"
            >
              <div class="verdict-left">
                <div class="verdict-icon">
                  <svg
                    *ngIf="result.credibility_label === 'Credible'"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg
                    *ngIf="result.credibility_label === 'Suspicious'"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <svg
                    *ngIf="result.credibility_label === 'False'"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <div class="verdict-label">
                    {{ result.credibility_label }}
                  </div>
                  <div class="verdict-id">{{ result.resume_id }}</div>
                </div>
              </div>
              <div class="conf-ring">
                <svg width="78" height="78" viewBox="0 0 78 78">
                  <circle
                    cx="39"
                    cy="39"
                    r="33"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    stroke-width="5"
                  />
                  <circle
                    cx="39"
                    cy="39"
                    r="33"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-dasharray="207.3"
                    [attr.stroke-dashoffset]="
                      207.3 * (1 - result.confidence_score)
                    "
                    transform="rotate(-90 39 39)"
                  />
                </svg>
                <div class="ring-val">
                  {{ (result.confidence_score * 100).toFixed(0)
                  }}<span class="ring-pct">%</span>
                </div>
              </div>
            </div>

            <div class="prob-section">
              <div class="prob-title">Class Probabilities</div>
              <div
                class="prob-row"
                *ngFor="let cls of ['credible', 'suspicious', 'false']"
              >
                <div class="prob-lbl" [ngClass]="'lbl-' + cls">
                  <span class="prob-dot"></span>{{ cls | titlecase }}
                </div>
                <div class="prob-track">
                  <div
                    class="prob-fill"
                    [ngClass]="'fill-' + cls"
                    [style.width.%]="getScore(cls) * 100"
                  ></div>
                </div>
                <span class="prob-pct"
                  >{{ (getScore(cls) * 100).toFixed(1) }}%</span
                >
              </div>
            </div>

            <div class="signals-2x2">
              <div
                class="sig-card"
                [ngClass]="
                  result.signal_breakdown.evidence_verification
                    .inflated_claims > 0
                    ? 'sig-bad'
                    : result.signal_breakdown.evidence_verification.has_projects
                      ? 'sig-ok'
                      : 'sig-warn'
                "
              >
                <div class="sig-head">
                  <div class="sig-ico">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <span class="sig-name">Evidence Verification</span>
                </div>
                <div class="sig-row">
                  <span>Projects</span
                  ><span
                    class="sig-val"
                    [ngClass]="
                      result.signal_breakdown.evidence_verification.has_projects
                        ? 'ok'
                        : 'bad'
                    "
                    >{{
                      result.signal_breakdown.evidence_verification.has_projects
                        ? 'Present ✓'
                        : 'Missing ✕'
                    }}</span
                  >
                </div>
                <div class="sig-row">
                  <span>Inflated Claims</span
                  ><span
                    class="sig-val"
                    [ngClass]="
                      result.signal_breakdown.evidence_verification
                        .inflated_claims > 0
                        ? 'bad'
                        : 'ok'
                    "
                    >{{
                      result.signal_breakdown.evidence_verification
                        .inflated_claims > 0
                        ? 'Detected ✕'
                        : 'None ✓'
                    }}</span
                  >
                </div>
              </div>

              <div
                class="sig-card"
                [ngClass]="
                  result.signal_breakdown.timeline_validation
                    .timeline_overlap ||
                  result.signal_breakdown.timeline_validation
                    .future_grad_year ||
                  result.signal_breakdown.timeline_validation
                    .impossible_timeline
                    ? 'sig-bad'
                    : 'sig-ok'
                "
              >
                <div class="sig-head">
                  <div class="sig-ico">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span class="sig-name">Timeline Validation</span>
                </div>
                <div class="sig-row">
                  <span>Date Overlap</span
                  ><span
                    class="sig-val"
                    [ngClass]="
                      result.signal_breakdown.timeline_validation
                        .timeline_overlap
                        ? 'bad'
                        : 'ok'
                    "
                    >{{
                      result.signal_breakdown.timeline_validation
                        .timeline_overlap
                        ? 'Detected ✕'
                        : 'None ✓'
                    }}</span
                  >
                </div>
                <div class="sig-row">
                  <span>Future Grad</span
                  ><span
                    class="sig-val"
                    [ngClass]="
                      result.signal_breakdown.timeline_validation
                        .future_grad_year
                        ? 'bad'
                        : 'ok'
                    "
                    >{{
                      result.signal_breakdown.timeline_validation
                        .future_grad_year
                        ? 'Yes ✕'
                        : 'No ✓'
                    }}</span
                  >
                </div>
                <div
                  class="sig-row"
                  *ngIf="
                    result.signal_breakdown.timeline_validation
                      .impossible_timeline
                  "
                >
                  <span>Impossible TL</span
                  ><span class="sig-val bad">Yes ✕</span>
                </div>
              </div>

              <div class="sig-card sig-neutral">
                <div class="sig-head">
                  <div class="sig-ico">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <span class="sig-name">Complexity Alignment</span>
                </div>
                <div class="sig-row">
                  <span>Skill Count</span
                  ><span class="sig-val neutral">{{
                    result.signal_breakdown.complexity_alignment.skill_count
                  }}</span>
                </div>
                <div class="sig-row">
                  <span>Skills / Year</span
                  ><span class="sig-val neutral">{{
                    result.signal_breakdown.complexity_alignment.skill_per_year.toFixed(
                      2
                    )
                  }}</span>
                </div>
                <div
                  class="sig-row"
                  *ngIf="
                    result.signal_breakdown.complexity_alignment
                      .achieve_per_job !== undefined
                  "
                >
                  <span>Achieve / Job</span
                  ><span
                    class="sig-val"
                    [ngClass]="
                      result.signal_breakdown.complexity_alignment
                        .achieve_per_job >= 1
                        ? 'ok'
                        : 'neutral'
                    "
                    >{{
                      result.signal_breakdown.complexity_alignment.achieve_per_job.toFixed(
                        1
                      )
                    }}</span
                  >
                </div>
              </div>

              <div
                class="sig-card"
                [ngClass]="
                  result.signal_breakdown.anomaly_detection.buzzword_count >
                    2 ||
                  result.signal_breakdown.anomaly_detection.title_mismatch ||
                  result.signal_breakdown.anomaly_detection.is_skill_overload
                    ? 'sig-warn'
                    : 'sig-ok'
                "
              >
                <div class="sig-head">
                  <div class="sig-ico">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <span class="sig-name">Anomaly Detection</span>
                </div>
                <div class="sig-row">
                  <span>Buzzwords</span
                  ><span
                    class="sig-val"
                    [ngClass]="
                      result.signal_breakdown.anomaly_detection.buzzword_count >
                      2
                        ? 'bad'
                        : 'ok'
                    "
                    >{{
                      result.signal_breakdown.anomaly_detection.buzzword_count
                    }}</span
                  >
                </div>
                <div class="sig-row">
                  <span>Job Count</span
                  ><span class="sig-val neutral">{{
                    result.signal_breakdown.anomaly_detection.job_count
                  }}</span>
                </div>
                <div
                  class="sig-row"
                  *ngIf="
                    result.signal_breakdown.anomaly_detection.title_mismatch !==
                    undefined
                  "
                >
                  <span>Title Match</span
                  ><span
                    class="sig-val"
                    [ngClass]="
                      result.signal_breakdown.anomaly_detection.title_mismatch
                        ? 'bad'
                        : 'ok'
                    "
                    >{{
                      result.signal_breakdown.anomaly_detection.title_mismatch
                        ? 'Mismatch ✕'
                        : 'OK ✓'
                    }}</span
                  >
                </div>
              </div>
            </div>

            <!-- ── XAI EXPLANATION PANEL ─────────────────────────────── -->
            <div class="xai-panel" *ngIf="result.explanation">
              <!-- Overall verdict — typewriter effect -->
              <div class="xai-verdict">
                <div class="xai-verdict-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </div>
                <div class="xai-verdict-body">
                  <div class="xai-verdict-label">Why this result?</div>
                  <div class="xai-verdict-text">
                    {{ xaiTypedText
                    }}<span
                      class="xai-cursor"
                      [class.xai-cursor-hidden]="xaiTypingDone"
                      >▋</span
                    >
                  </div>
                </div>
                <div
                  class="xai-conf-badge"
                  [ngClass]="'badge-' + result.credibility_label.toLowerCase()"
                >
                  {{ result.explanation.confidence_text }}
                </div>
              </div>

              <!-- Strengths & Concerns — staggered fade in after typing done -->
              <div class="xai-cols" *ngIf="xaiTypingDone">
                <div
                  class="xai-col"
                  *ngIf="result.explanation.strengths.length > 0"
                >
                  <div class="xai-col-head strengths-head">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M9 12l2 2 4-4" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Strengths
                  </div>
                  <div
                    class="xai-item"
                    *ngFor="
                      let s of result.explanation.strengths;
                      let i = index
                    "
                    [class.xai-item-visible]="i < xaiItemsVisible"
                  >
                    <span class="xai-item-icon">{{ s.icon }}</span>
                    <div>
                      <div class="xai-item-signal">{{ s.signal }}</div>
                      <div class="xai-item-text">{{ s.explanation }}</div>
                    </div>
                  </div>
                </div>
                <div
                  class="xai-col"
                  *ngIf="result.explanation.concerns.length > 0"
                >
                  <div class="xai-col-head concerns-head">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M12 9v2m0 4h.01" />
                      <path
                        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                      />
                    </svg>
                    Concerns
                  </div>
                  <div
                    class="xai-item concern-item"
                    *ngFor="let c of result.explanation.concerns; let i = index"
                    [class.xai-item-visible]="i < xaiItemsVisible"
                  >
                    <span class="xai-item-icon">{{ c.icon }}</span>
                    <div>
                      <div class="xai-item-signal">{{ c.signal }}</div>
                      <div class="xai-item-text">{{ c.explanation }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SHAP chart — slides in after items done -->
              <div
                class="xai-chart"
                *ngIf="
                  xaiChartVisible && result.explanation.top_factors.length > 0
                "
              >
                <div class="xai-chart-title">
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  SHAP Feature Impact
                  <span class="xai-method">{{
                    result.explanation.explanation_method
                  }}</span>
                </div>
                <div
                  class="shap-row"
                  *ngFor="
                    let f of result.explanation.top_factors;
                    let i = index
                  "
                  [class.shap-row-visible]="xaiChartVisible"
                  [style.animation-delay.ms]="i * 80"
                >
                  <div class="shap-label">{{ f.feature }}</div>
                  <div class="shap-bars">
                    <div
                      class="shap-bar"
                      [ngClass]="
                        f.direction === 'positive' ? 'shap-pos' : 'shap-neg'
                      "
                      [style.width.%]="getShapWidth(f.shap)"
                    ></div>
                  </div>
                  <div
                    class="shap-score"
                    [ngClass]="
                      f.direction === 'positive'
                        ? 'shap-pos-txt'
                        : 'shap-neg-txt'
                    "
                  >
                    {{ f.shap > 0 ? '+' : '' }}{{ f.shap.toFixed(3) }}
                  </div>
                </div>
              </div>

              <div class="xai-footer" *ngIf="xaiChartVisible">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"
                  />
                  <polyline points="13 2 13 9 20 9" />
                </svg>
                Powered by SHAP TreeExplainer · Random Forest · CAD-S v7 (10,100
                records)
              </div>
            </div>

            <div class="result-footer">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Assessed
              {{ result.timestamp | date: 'MMM d, y · h:mm a' }} &nbsp;·&nbsp;
              Random Forest &nbsp;·&nbsp; SHAP XAI

              <button
                class="download-btn"
                (click)="downloadReport()"
                [disabled]="downloadingReport"
              >
                <svg
                  *ngIf="!downloadingReport"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <svg
                  *ngIf="downloadingReport"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="spin"
                >
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M12 2a10 10 0 0110 10" />
                </svg>
                {{ downloadingReport ? 'Generating...' : 'Download Report' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .assess-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 48px 24px 80px;
      }
      .page-header {
        margin-bottom: 40px;
      }
      .page-title {
        font-size: 2rem;
        font-weight: 800;
        margin: 10px 0 12px;
        letter-spacing: -0.01em;
      }
      .page-sub {
        color: var(--text-secondary);
        font-size: 0.95rem;
      }

      .assess-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
        align-items: start;
      }
      @media (max-width: 900px) {
        .assess-layout {
          grid-template-columns: 1fr;
        }
      }

      .form-col {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 26px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Tabs */
      .tab-bar {
        display: flex;
        background: var(--bg-card2);
        border-radius: var(--radius);
        padding: 4px;
        gap: 3px;
      }
      .tab-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 9px;
        border: none;
        border-radius: 8px;
        background: transparent;
        color: var(--text-muted);
        font-family: 'DM Sans', sans-serif;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        &.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        &:hover:not(.active) {
          color: var(--text-secondary);
        }
      }

      /* Upload zone */
      .upload-zone {
        border: 2px dashed var(--border);
        border-radius: var(--radius-lg);
        min-height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        padding: 24px;
        &:hover:not(.loading):not(.has-file),
        &.drag-over {
          border-color: var(--orange);
          background: var(--orange-glow);
        }
        &.has-file {
          border-color: rgba(34, 197, 94, 0.35);
          background: rgba(34, 197, 94, 0.05);
          cursor: default;
        }
        &.loading {
          border-color: var(--orange);
          background: var(--orange-glow);
          cursor: default;
        }
      }
      .dz-idle {
        text-align: center;
      }
      .dz-icon {
        width: 56px;
        height: 56px;
        background: var(--bg-card2);
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        color: var(--text-muted);
      }
      .dz-title {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 4px;
        color: var(--text-primary);
      }
      .dz-sub {
        font-size: 0.78rem;
        color: var(--text-muted);
      }

      .dz-loading {
        text-align: center;
      }
      .dz-spin {
        width: 36px;
        height: 36px;
        border: 3px solid rgba(255, 107, 26, 0.2);
        border-top-color: var(--orange);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 12px;
      }
      .dz-loading-text {
        font-size: 0.88rem;
        color: var(--orange-bright);
        font-weight: 500;
      }

      .dz-done {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
      }
      .dz-done-icon {
        width: 38px;
        height: 38px;
        background: rgba(34, 197, 94, 0.12);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--green);
        flex-shrink: 0;
      }
      .dz-done-text {
        flex: 1;
      }
      .dz-fname {
        font-weight: 600;
        font-size: 0.88rem;
        color: var(--text-primary);
      }
      .dz-fmeta {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 2px;
      }

      .dz-error {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        width: 100%;
        color: var(--red);
      }
      .dz-err-title {
        font-weight: 600;
        font-size: 0.88rem;
      }
      .dz-err-msg {
        font-size: 0.76rem;
        margin-top: 2px;
        opacity: 0.8;
      }

      .rm-file-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-muted);
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.82rem;
        margin-left: auto;
        flex-shrink: 0;
        &:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--red);
        }
      }

      /* Extracted section */
      .extracted-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .extracted-banner {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: rgba(59, 130, 246, 0.08);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: var(--radius);
        padding: 10px 12px;
        font-size: 0.8rem;
        color: #93c5fd;
        line-height: 1.55;
        svg {
          flex-shrink: 0;
          margin-top: 1px;
        }
        strong {
          color: #bfdbfe;
        }
      }

      /* Text fields */
      .text-fields {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .field-group {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .field-label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-secondary);
        svg {
          color: var(--text-muted);
        }
      }
      .req {
        color: var(--orange);
        margin-left: 2px;
      }
      .optional {
        color: var(--text-muted);
        font-weight: 400;
      }
      .cf-textarea {
        width: 100%;
        background: var(--bg-card2);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 11px 13px;
        color: var(--text-primary);
        font-family: 'DM Sans', sans-serif;
        font-size: 0.875rem;
        line-height: 1.6;
        resize: vertical;
        transition: border-color 0.2s;
        &:focus {
          outline: none;
          border-color: var(--orange);
          box-shadow: 0 0 0 3px rgba(255, 107, 26, 0.1);
        }
        &::placeholder {
          color: var(--text-muted);
        }
      }

      /* Samples */
      .sample-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .sample-label {
        font-size: 0.78rem;
        color: var(--text-muted);
        font-weight: 500;
        flex-shrink: 0;
      }
      .sample-btn {
        padding: 6px 13px;
        border-radius: 6px;
        border: 1px solid;
        background: transparent;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        font-family: 'DM Sans', sans-serif;
        &.credible {
          border-color: rgba(34, 197, 94, 0.3);
          color: var(--green);
          &:hover {
            background: var(--green-bg);
          }
        }
        &.suspicious {
          border-color: rgba(234, 179, 8, 0.3);
          color: var(--yellow);
          &:hover {
            background: var(--yellow-bg);
          }
        }
        &.false {
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--red);
          &:hover {
            background: var(--red-bg);
          }
        }
      }

      /* Error */
      .error-msg {
        display: flex;
        align-items: center;
        gap: 9px;
        background: var(--red-bg);
        border: 1px solid rgba(239, 68, 68, 0.22);
        border-radius: var(--radius);
        padding: 11px 14px;
        color: var(--red);
        font-size: 0.875rem;
      }

      /* Actions */
      .form-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        justify-content: flex-end;
      }
      .assess-btn {
        flex: 1;
        justify-content: center;
        padding: 13px;
        font-size: 0.95rem;
      }
      .spinner {
        width: 15px;
        height: 15px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Results column */
      .results-col {
        position: sticky;
        top: 80px;
      }
      .empty-state {
        background: var(--bg-card);
        border: 1px dashed var(--border);
        border-radius: var(--radius-xl);
        padding: 60px 28px;
        text-align: center;
      }
      .empty-icon {
        width: 68px;
        height: 68px;
        background: var(--bg-card2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 18px;
        color: var(--text-muted);
      }
      .empty-title {
        font-weight: 700;
        font-size: 0.95rem;
        margin-bottom: 7px;
        color: var(--text-primary);
      }
      .empty-sub {
        font-size: 0.83rem;
        color: var(--text-muted);
      }

      /* Skeleton */
      .skeleton-wrap {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 26px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      @keyframes shimmer {
        0% {
          background-position: -400px 0;
        }
        100% {
          background-position: 400px 0;
        }
      }
      .sk-hero,
      .sk-bar,
      .sk-card {
        background: linear-gradient(
          90deg,
          var(--bg-card2) 0%,
          rgba(255, 255, 255, 0.04) 50%,
          var(--bg-card2) 100%
        );
        background-size: 400px 100%;
        animation: shimmer 1.4s ease infinite;
        border-radius: var(--radius);
      }
      .sk-hero {
        height: 96px;
        border-radius: var(--radius-lg);
      }
      .sk-bars {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .sk-bar {
        height: 14px;
      }
      .sk-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 9px;
      }
      .sk-card {
        height: 76px;
      }

      /* Result */
      .result-wrap {
        display: flex;
        flex-direction: column;
        gap: 13px;
      }
      .verdict-card {
        border-radius: var(--radius-lg);
        padding: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid;
        &.credible {
          background: var(--green-bg);
          border-color: rgba(34, 197, 94, 0.25);
          color: var(--green);
        }
        &.suspicious {
          background: var(--yellow-bg);
          border-color: rgba(234, 179, 8, 0.25);
          color: var(--yellow);
        }
        &.false {
          background: var(--red-bg);
          border-color: rgba(239, 68, 68, 0.25);
          color: var(--red);
        }
      }
      .verdict-left {
        display: flex;
        align-items: center;
        gap: 13px;
      }
      .verdict-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .verdict-label {
        font-family: 'Syne', sans-serif;
        font-size: 1.5rem;
        font-weight: 800;
        line-height: 1;
      }
      .verdict-id {
        font-family: 'Space Mono', monospace;
        font-size: 0.67rem;
        opacity: 0.55;
        margin-top: 3px;
      }
      .conf-ring {
        position: relative;
        width: 78px;
        height: 78px;
        flex-shrink: 0;
      }
      .ring-val {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Syne', sans-serif;
        font-size: 1.25rem;
        font-weight: 800;
      }
      .ring-pct {
        font-size: 0.7rem;
        font-weight: 700;
      }

      .prob-section {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 16px;
      }
      .prob-title {
        font-size: 0.7rem;
        font-family: 'Space Mono', monospace;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 11px;
        font-weight: 700;
      }
      .prob-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        &:last-child {
          margin-bottom: 0;
        }
      }
      .prob-lbl {
        width: 90px;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        &.lbl-credible {
          color: var(--green);
        }
        &.lbl-suspicious {
          color: var(--yellow);
        }
        &.lbl-false {
          color: var(--red);
        }
      }
      .prob-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        flex-shrink: 0;
      }
      .prob-track {
        flex: 1;
        height: 7px;
        background: var(--bg-card2);
        border-radius: 4px;
        overflow: hidden;
      }
      .prob-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .fill-credible {
        background: linear-gradient(90deg, #16a34a, #22c55e);
      }
      .fill-suspicious {
        background: linear-gradient(90deg, #b45309, #eab308);
      }
      .fill-false {
        background: linear-gradient(90deg, #b91c1c, #ef4444);
      }
      .prob-pct {
        width: 40px;
        text-align: right;
        font-family: 'Space Mono', monospace;
        font-size: 0.73rem;
        color: var(--text-secondary);
      }

      .signals-2x2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 9px;
      }
      .sig-card {
        background: var(--bg-card);
        border: 1px solid;
        border-radius: var(--radius);
        padding: 12px;
        &.sig-ok {
          border-color: rgba(34, 197, 94, 0.2);
        }
        &.sig-warn {
          border-color: rgba(234, 179, 8, 0.2);
        }
        &.sig-bad {
          border-color: rgba(239, 68, 68, 0.2);
        }
        &.sig-neutral {
          border-color: rgba(59, 130, 246, 0.2);
        }
      }
      .sig-head {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 9px;
      }
      .sig-ico {
        width: 25px;
        height: 25px;
        background: var(--bg-card2);
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-muted);
        flex-shrink: 0;
      }
      .sig-name {
        font-size: 0.74rem;
        font-weight: 700;
        color: var(--text-secondary);
      }
      .sig-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.74rem;
        color: var(--text-muted);
        padding: 3px 0;
        border-top: 1px solid var(--border);
      }
      .sig-val {
        font-weight: 700;
        font-family: 'Space Mono', monospace;
        font-size: 0.68rem;
      }
      .sig-val.ok {
        color: var(--green);
      }
      .sig-val.bad {
        color: var(--red);
      }
      .sig-val.neutral {
        color: #60a5fa;
      }

      .result-footer {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 0.7rem;
        font-family: 'Space Mono', monospace;
        color: var(--text-muted);
        padding: 7px 0;
      }

      /* ── XAI Panel ─────────────────────────────────────────────────────────── */
      .xai-panel {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      /* Verdict row */
      .xai-verdict {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.02);
      }
      .xai-verdict-icon {
        width: 30px;
        height: 30px;
        background: rgba(99, 102, 241, 0.12);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #818cf8;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .xai-verdict-body {
        flex: 1;
        min-width: 0;
      }
      .xai-verdict-label {
        font-size: 0.68rem;
        font-family: 'Space Mono', monospace;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        margin-bottom: 4px;
        font-weight: 700;
      }
      .xai-verdict-text {
        font-size: 0.82rem;
        color: var(--text-secondary);
        line-height: 1.55;
      }
      .xai-conf-badge {
        flex-shrink: 0;
        font-size: 0.67rem;
        font-weight: 700;
        padding: 4px 9px;
        border-radius: 20px;
        border: 1px solid;
        white-space: nowrap;
        font-family: 'Space Mono', monospace;
        &.badge-credible {
          background: var(--green-bg);
          border-color: rgba(34, 197, 94, 0.3);
          color: var(--green);
        }
        &.badge-suspicious {
          background: var(--yellow-bg);
          border-color: rgba(234, 179, 8, 0.3);
          color: var(--yellow);
        }
        &.badge-false {
          background: var(--red-bg);
          border-color: rgba(239, 68, 68, 0.3);
          color: var(--red);
        }
      }

      /* Strengths / Concerns columns */
      .xai-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        border-bottom: 1px solid var(--border);
        &:has(.xai-col:only-child) {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 600px) {
        .xai-cols {
          grid-template-columns: 1fr;
        }
      }

      .xai-col {
        padding: 14px;
        &:first-child:not(:last-child) {
          border-right: 1px solid var(--border);
        }
      }
      .xai-col-head {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        margin-bottom: 10px;
        font-family: 'Space Mono', monospace;
        &.strengths-head {
          color: var(--green);
          svg {
            color: var(--green);
          }
        }
        &.concerns-head {
          color: var(--yellow);
          svg {
            color: var(--yellow);
          }
        }
      }
      .concern-item .xai-item-signal {
        color: var(--yellow);
      }
      .xai-item-icon {
        font-size: 0.9rem;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .xai-item-signal {
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--green);
        margin-bottom: 2px;
      }
      .xai-item-text {
        font-size: 0.74rem;
        color: var(--text-muted);
        line-height: 1.5;
      }

      /* SHAP chart */
      .xai-chart {
        padding: 14px;
        border-bottom: 1px solid var(--border);
      }
      .xai-chart-title {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.68rem;
        font-family: 'Space Mono', monospace;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-muted);
        margin-bottom: 12px;
      }
      .xai-method {
        margin-left: auto;
        font-size: 0.62rem;
        opacity: 0.6;
        font-weight: 400;
        text-transform: none;
        letter-spacing: 0;
      }
      .shap-label {
        font-size: 0.73rem;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .shap-bars {
        height: 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        overflow: hidden;
      }
      .shap-bar {
        height: 100%;
        border-radius: 4px;
        min-width: 3px;
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        &.shap-pos {
          background: linear-gradient(90deg, #16a34a, #22c55e);
        }
        &.shap-neg {
          background: linear-gradient(90deg, #b91c1c, #ef4444);
        }
      }
      .shap-score {
        font-family: 'Space Mono', monospace;
        font-size: 0.67rem;
        text-align: right;
        font-weight: 700;
        &.shap-pos-txt {
          color: var(--green);
        }
        &.shap-neg-txt {
          color: var(--red);
        }
      }

      /* XAI footer */
      .xai-footer {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 9px 14px;
        font-size: 0.66rem;
        font-family: 'Space Mono', monospace;
        color: rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.01);
      }

      /* Download button inside result footer */
      .download-btn {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text-secondary);
        font-size: 0.72rem;
        font-family: 'Space Mono', monospace;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.18s ease;
        white-space: nowrap;
        &:hover:not(:disabled) {
          border-color: var(--orange);
          color: var(--orange);
          background: rgba(249, 115, 22, 0.06);
        }
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .spin {
        animation: spin 0.8s linear infinite;
      }

      /* ── Typewriter animations ── */
      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
      }
      .xai-cursor {
        display: inline-block;
        color: #818cf8;
        animation: blink 0.85s step-end infinite;
        font-weight: 400;
        margin-left: 1px;
      }
      .xai-cursor-hidden {
        opacity: 0;
        animation: none;
      }

      /* Items start invisible, fade+slide in */
      .xai-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 7px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        &:last-child {
          border-bottom: none;
        }
        opacity: 0;
        transform: translateY(6px);
        transition:
          opacity 0.35s ease,
          transform 0.35s ease;
      }
      .xai-item.xai-item-visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* SHAP rows slide in from left */
      @keyframes shap-slide-in {
        from {
          opacity: 0;
          transform: translateX(-8px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      .shap-row {
        display: grid;
        grid-template-columns: 140px 1fr 52px;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;
        &:last-child {
          margin-bottom: 0;
        }
        opacity: 0;
      }
      .shap-row.shap-row-visible {
        animation: shap-slide-in 0.4s ease forwards;
      }
    `,
  ],
})
export class AssessmentFormComponent implements AfterViewInit, OnDestroy {
  tab: TabType = 'text';
  resume: ResumeInput = {
    skills: '',
    experience: '',
    education: '',
    projects: '',
  };
  result: AssessmentResult | null = null;
  loading = false;
  error: string | null = null;
  isDragging = false;
  uploadState: UploadState = 'idle';
  uploadedFileName = '';
  uploadError = '';

  // ── Typewriter XAI state ─────────────────────────────────────────────────
  xaiTypedText = '';
  xaiTypingDone = false;
  xaiItemsVisible = 0;
  xaiChartVisible = false;
  private _typeTimer: any;
  private _itemTimer: any;

  // ── Report download state ────────────────────────────────────────────────
  downloadingReport = false;

  constructor(private api: ApiService) {}

  ngAfterViewInit() {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  getScore(cls: string): number {
    if (!this.result) return 0;
    return (
      this.result.class_scores[cls as keyof typeof this.result.class_scores] ??
      0
    );
  }

  getShapWidth(shap: number): number {
    // Scale SHAP values to % width for the bar chart
    // Max realistic SHAP for this model is ~0.25, scale to 100%
    return Math.min(100, (Math.abs(shap) / 0.25) * 100);
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
    (e.target as HTMLInputElement).value = '';
  }

  async processFile(file: File) {
    this.uploadState = 'loading';
    this.uploadedFileName = file.name;
    this.uploadError = '';
    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      if (ext === 'pdf') {
        // Send PDF to backend — Python/PyMuPDF gives far better extraction than browser PDF.js
        await this.extractPdfBackend(file);
      } else if (ext === 'txt') {
        await this.extractTxt(file);
      } else {
        throw new Error(
          `".${ext}" is not supported. Upload a PDF or .txt file.`,
        );
      }
      this.uploadState = 'done';
    } catch (err: any) {
      this.uploadState = 'error';
      this.uploadError = err.message || 'Could not read the file.';
    }
  }

  /** Send PDF to FastAPI /extract-pdf endpoint — backend uses PyMuPDF for clean extraction */
  private extractPdfBackend(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      this.api.extractPdf(formData).subscribe({
        next: (fields) => {
          this.resume = {
            skills: fields.skills || '',
            experience: fields.experience || '',
            education: fields.education || '',
            projects: fields.projects || '',
          };
          resolve();
        },
        error: (err) => {
          const msg =
            err?.error?.detail ||
            'PDF extraction failed. Make sure the backend is running.';
          reject(new Error(msg));
        },
      });
    });
  }

  private extractTxt(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.parseAndFillFields(e.target?.result as string);
        resolve();
      };
      reader.onerror = () => reject(new Error('Could not read the text file.'));
      reader.readAsText(file, 'utf-8');
    });
  }

  // ── Known technical skills vocabulary ────────────────────────────────────
  private readonly KNOWN_SKILLS = [
    'React JS',
    'React js',
    'React',
    'Next.js',
    'Next JS',
    'Node.js',
    'Node Js',
    'Angular',
    'Vue.js',
    'Vue',
    'Flutter',
    'Flask',
    'Django',
    'FastAPI',
    'Spring Boot',
    'Express.js',
    'Java',
    'Python',
    'PHP',
    'JavaScript',
    'TypeScript',
    'GoLang',
    'Golang',
    'Go',
    'R',
    'C++',
    'C#',
    'Kotlin',
    'Swift',
    'Ruby',
    'Rust',
    'Scala',
    'HTML',
    'CSS',
    'SCSS',
    'MySQL',
    'MongoDB',
    'PostgreSQL',
    'SQLite',
    'Firebase',
    'Figma',
    'Sketch',
    'Canva',
    'Photoshop',
    'Adobe Photoshop',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'GCP',
    'Git',
    'GitHub',
    'Auth0',
    'Redux',
    'Tailwind',
    'Bootstrap',
    'Wireframing',
    'Prototyping',
    'Responsive UI',
    'TensorFlow',
    'PyTorch',
    'Google AR Core',
    'Dotnet',
    '.NET',
    'React Native',
    'Machine learning',
  ];

  /** "S K I L L S" → "SKILLS" */
  private normaliseHeaders(text: string): string {
    return text.replace(/\b([A-Z])(?: [A-Z]){2,}\b/g, (m) =>
      m.replace(/ /g, ''),
    );
  }

  /** Return text between keyword and the next section keyword.
   *  Searches for the MOST SPECIFIC match — "PROFESSIONAL EXPERIENCE" before "EXPERIENCE"
   *  to avoid matching the word inside a longer heading. */
  private findSection(text: string, keyword: string): string {
    const STOPS = [
      'SKILLS',
      'EDUCATION',
      'PROFESSIONAL EXPERIENCE',
      'WORK EXPERIENCE',
      'EXPERIENCE',
      'PROJECTS',
      'ACHIEVEMENTS',
      'CERTIFICATIONS',
      'EXTRA-CURRICULAR',
      'EXTRACURRICULAR',
      'REFERENCE',
      'DECLARATION',
      'CERTIFICATES',
      'PROFILE',
    ];
    const idx = text.indexOf(keyword);
    if (idx < 0) return '';
    const start = idx + keyword.length;
    let end = text.length;
    for (const stop of STOPS) {
      if (stop === keyword) continue;
      const si = text.indexOf(stop, start);
      if (si > 0 && si < end) end = si;
    }
    return text.slice(start, end).trim();
  }

  /** Split concatenated skill strings like "FigmaWireframingPrototyping" */
  private splitKnownSkills(chunk: string): string[] {
    const sorted = [...this.KNOWN_SKILLS].sort((a, b) => b.length - a.length);
    const results: string[] = [];
    let remaining = chunk.trim();
    while (remaining.length > 0) {
      let matched = false;
      for (const skill of sorted) {
        if (remaining.toLowerCase().startsWith(skill.toLowerCase())) {
          results.push(skill);
          remaining = remaining.slice(skill.length).replace(/^[\s,]+/, '');
          matched = true;
          break;
        }
      }
      if (!matched) remaining = remaining.slice(1);
    }
    return results;
  }

  /**
   * Universal CV parser — handles all tested PDF layouts:
   *  • Canva multi-column  (Asela)   — |  separator, skills at end, date before title
   *  • Single-column student (Nethmini) — spaced headers, space-sep skills per sub-category
   *  • Mixed layout (Nimaya)          — concatenated skills, "Title Company Date" pattern
   */
  private parseAndFillFields(rawText: string) {
    // 1 ── Clean ──────────────────────────────────────────────────────────────
    let text = rawText
      .replace(/[\w.+-]+@[\w.-]+\.\w+/g, '')
      .replace(/\+?[\d][\d\s\-().]{7,15}\d/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 2 ── Normalise spaced headers + fix kerning artefacts ───────────────────
    text = this.normaliseHeaders(text);
    const fixes: [RegExp, string][] = [
      [/Mong\s*oDB/gi, 'MongoDB'],
      [/Au\s*th0/gi, 'Auth0'],
      [/Node\s*\.\s*js/gi, 'Node.js'],
      [/Go\s*Lang/gi, 'GoLang'],
      [/West\s*min+ster/gi, 'Westminster'],
      [/RE\s*ST/gi, 'REST'],
      // Fix "2025 JunUI" → "2025 Jun UI" (Nimaya concatenation)
      [/(Jun|Jul|Jan|Feb|Mar|Apr|May|Aug|Sep|Oct|Nov|Dec)([A-Z])/g, '$1 $2'],
      // Fix "EngineerDeveloped" → "Engineer. Developed"
      [
        /(Engineer|Executive|Developer|Designer|Manager|Analyst|Consultant)(?=[A-Z][a-z])/g,
        '$1. ',
      ],
    ];
    for (const [pat, rep] of fixes) text = text.replace(pat, rep);

    // 3 ── SKILLS ─────────────────────────────────────────────────────────────
    const SOFT_SKILL = new Set([
      'trustworthiness',
      'time management',
      'creative expertise',
      'passion for design',
      'team collaboration',
      'teamwork',
      'communication',
      'leadership',
      'project management',
      'customer empathy',
      'quick learning',
      'problem solving',
      'problem-solving',
      'critical thinking',
      'adaptability',
      'attention to detail',
      'quick',
    ]);
    const NOISE_RE =
      /google drive|microsoft office|\bdocs\b|\bsheets\b|\bslides\b|lightroom|adobe lightroom|\bieee\b|member|no -|developed|built|awarded|completed|presented|\bsuite\b|\bword\b|\bexcel\b|\bpowerpoint\b/i;
    const SUBCAT_RE =
      /(?:Programming Languages?|Web Development|UI\/?UX Design(?:er)?|Software Proficiency|Technical Skills?|Soft Skills?|Frameworks?\s*(?:&\s*Libraries?)?|Libraries?|DataBase|Databases?|Designing Tools?|Framework\s*&\s*Libraries?)\s*:?\s*/gi;

    const skillsIdx = text.lastIndexOf('SKILLS');
    let skills = '';

    if (skillsIdx >= 0) {
      const STOPS2 = [
        'ACHIEVEMENTS',
        'CERTIFICATIONS',
        'EXTRA-CURRICULAR',
        'EXTRA CURRICULAR',
        'EXTRACURRICULAR',
        'REFERENCE',
        'DECLARATION',
        'CERTIFICATES',
      ];
      let blockEnd = Math.min(skillsIdx + 600, text.length);
      for (const s of STOPS2) {
        const i = text.indexOf(s, skillsIdx + 6);
        if (i > 0 && i < blockEnd) blockEnd = i;
      }
      let block = text.slice(skillsIdx + 6, blockEnd);
      block = block.replace(SUBCAT_RE, '|');

      const items: string[] = [];
      for (const chunk of block.split('|')) {
        const c = chunk.trim();
        if (!c) continue;
        if (c.includes(',')) {
          for (const item of c.split(',')) items.push(item.trim());
        } else {
          const found = this.splitKnownSkills(c);
          if (found.length > 0) items.push(...found);
          else if (2 <= c.length && c.length <= 35) items.push(c);
        }
      }

      const seen2 = new Set<string>();
      const clean: string[] = [];
      for (const s of items) {
        const t = s.trim();
        if (!t || t.length < 2 || t.length > 40) continue;
        if (SOFT_SKILL.has(t.toLowerCase())) continue;
        if (NOISE_RE.test(t)) continue;
        if (!seen2.has(t.toLowerCase())) {
          seen2.add(t.toLowerCase());
          clean.push(t);
        }
      }
      skills = clean.join(', ');
    }

    // 4 ── EXPERIENCE ─────────────────────────────────────────────────────────
    // Handles: "Mon YYYY – Mon YYYY", "YYYY Mon – YYYY Mon", "YYYY Mon – Present"
    const DATE_PAT =
      /(?:\d{4}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*[-–]\s*(?:\d{4}\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*[-–]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|Present|Current)|\d{4}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*[-–]\s*Present)/gi;

    // Includes "Intern-Software Engineer" explicitly (Asela's Canva CV layout)
    const TITLE_RE =
      /(?:Intern[\s-]Software\s+Engineer|Software\s+Developer(?:\s+Internship)?|UI\/?UX\s+Designer(?:\s+Internship)?|Software\s+Engineer(?:\s+Internship)?|Technical\s+Support\s+Executive|Full[\s-]Stack\s+Developer|Intern[\w\s-]*(?:Engineer|Developer)|Developer|Engineer|Manager|Analyst|Consultant|Designer)(?:\s+Internship)?/i;

    const BULLET_RE =
      /((?:Developed|Built|Provided|Assisted|Implemented|Contributed|Managed|Designed|Created|Led|Collaborated|Deployed|Integrated)[^.]{10,120}\.)/gi;

    // CV header titles — skip these if matched as job titles
    const CV_HEADERS = new Set([
      'full-stack developer',
      'front-end developer',
      'back-end developer',
      'developer',
      'engineer',
      'software engineering undergraduate',
      'computer science undergraduate',
    ]);

    // Education noise — if these appear near a date, it's an edu date not a job date
    const EDU_NOISE =
      /University|College|BSc|BEng|Diploma|GCE|Advanced Level|Ordinary Level|Campus|School|Institute|Undergraduate/i;

    // Try structured section first (Nimaya has clean WORK EXPERIENCE section)
    const expSection =
      this.findSection(text, 'WORK EXPERIENCE') ||
      this.findSection(text, 'PROFESSIONAL EXPERIENCE') ||
      this.findSection(text, 'EXPERIENCE');
    // Use section if it has dates; otherwise fall back to full text (Canva multi-col CVs)
    const hasDateInSection = expSection && DATE_PAT.test(expSection);
    DATE_PAT.lastIndex = 0; // reset regex state after .test()
    const searchText = hasDateInSection ? expSection : text;

    const jobs: string[] = [];
    const dateMatches = [...searchText.matchAll(DATE_PAT)];

    for (let i = 0; i < dateMatches.length; i++) {
      const dm = dateMatches[i];
      const dateStr = dm[0].replace(/\s+/g, ' ').trim();
      const pos = dm.index!;
      const end = pos + dm[0].length;

      // For section-based search, limit each job's "after" zone to before the next date
      const nextDatePos = dateMatches[i + 1]?.index ?? searchText.length;
      const before = searchText.slice(Math.max(0, pos - 200), pos);
      const after = searchText.slice(end, Math.min(end + 400, nextDatePos));

      // Skip education dates
      const ctx = before.slice(-100) + after.slice(0, 100);
      if (EDU_NOISE.test(ctx)) continue;

      // Title: look before date (standard layout), then after date (Canva layout)
      let titleMatch = TITLE_RE.exec(before.slice(-120));
      let title = titleMatch ? titleMatch[0].trim() : '';
      if (!title || CV_HEADERS.has(title.toLowerCase())) {
        const afterMatch = TITLE_RE.exec(after.slice(0, 100));
        const afterTitle = afterMatch ? afterMatch[0].trim() : '';
        if (afterTitle && !CV_HEADERS.has(afterTitle.toLowerCase()))
          title = afterTitle;
        else if (!afterTitle) title = '';
      }

      const bullets = [...after.matchAll(BULLET_RE)]
        .map((m) => m[1].trim())
        .slice(0, 2);
      if (!title && !bullets.length) continue;

      // Company: between title and date (standard), or after bullets (Canva)
      let company = '';
      const beforeClean = before
        .replace(
          /(?:PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|SUMMARY|PROJECTS|FULL-STACK DEVELOPER|ASELA PERERA)\s*/gi,
          '',
        )
        .replace(/\s*-?\s*Remote\s*$/i, '')
        .trim();

      if (titleMatch && !CV_HEADERS.has(title.toLowerCase())) {
        const tp = beforeClean.lastIndexOf(title);
        if (tp >= 0)
          company = beforeClean
            .slice(tp + title.length)
            .replace(/^[\s-]+/, '')
            .replace(/\s*-?\s*Remote\s*$/i, '')
            .trim();
      } else {
        const cm =
          /(Evolza\.io|Evolza|Rapidventure\s*Pvt\s*Ltd|Crowderia\s*AB|Absol\s*x\s*Core\s*AI|Codegen\s*International[^(]*|[A-Z][a-zA-Z0-9\s.]+?(?:\.io|Ltd|Pvt|AB|Inc))/i.exec(
            after.slice(0, 200),
          );
        if (cm)
          company = cm[1]
            .trim()
            .replace(/\s*-?\s*Remote\s*$/i, '')
            .replace(/\s*\([^)]*\)\s*$/, '')
            .trim();
      }

      let entry = title || 'Role';
      if (
        company &&
        company.length > 1 &&
        company.toLowerCase() !== title.toLowerCase()
      )
        entry += ` at ${company}`;
      entry += ` (${dateStr}).`;
      if (bullets.length) entry += ' ' + bullets.join(' ');
      jobs.push(entry);
    }

    const experience =
      jobs.length > 0 ? jobs.join(' | ') : 'No work experience listed';

    // 5 ── EDUCATION ──────────────────────────────────────────────────────────
    // Fix: use aggressive camelCase split (catches "EnglishESOFT" → "English ESOFT")
    // and search FULL TEXT after first 400 chars (Canva CVs put BSc before EDUCATION heading)
    const textEdu = text.replace(/([a-z])([A-Z])/g, '$1 $2');
    const eduItems: string[] = [];

    // University degree — search full text from pos 400 (skip profile/summary)
    // Also look 200 chars BEFORE the degree match for university name (Nethmini layout)
    const degPatterns: RegExp[] = [
      /(?:Undergraduate\s*[-–]?\s*)?(BSc?\s*\(?Hons\)?)\s+(?:in\s+)?(Computer\s+Science|Software\s+Engineering)/i,
      /(?:Undergraduate\s*[-–]?\s*)?(BEng?\s*\(?Hons\)?)\s+(?:in\s+)?(Software\s+Engineering|Computer\s+Science)/i,
      /(BEng?\s*\(?Hons\)?\s*Software\s+Engineering)/i,
    ];
    for (const pat of degPatterns) {
      const dm = pat.exec(textEdu.slice(400));
      if (!dm) continue;
      const realPos = dm.index + 400;
      const groups = dm.slice(1).filter(Boolean);
      let degree =
        groups.length >= 2
          ? `${groups[0].trim()} ${groups[1].trim()}`
          : (groups[0]?.trim() ?? dm[0].trim());
      degree = degree.replace(/^Undergraduate\s*[-–]?\s*/i, '').trim();

      // University: look 200 chars before AND 200 after the degree
      const window = textEdu.slice(Math.max(0, realPos - 200), realPos + 250);
      const uniM =
        /(University of Westminster(?:\s+\(?IIT[^)]*\)?)?|IIT(?:\s*[-–]\s*Sri\s*Lanka)?|Informatics Institute of Technology)/i.exec(
          window,
        );
      const uni = uniM ? uniM[1].trim() : '';

      // Year range
      const yrM =
        /((?:Sep|Oct|Jan|Feb|September|October)\s*20\d{2}|20\d{2})\s*[-–]\s*(Present|Current|20\d{2})/i.exec(
          textEdu.slice(realPos, realPos + 300),
        );
      const yr = yrM ? ` (${yrM[1].trim()} – ${yrM[2].trim()})` : '';

      let entry = degree;
      if (uni && !degree.toLowerCase().includes(uni.toLowerCase().slice(0, 12)))
        entry += `, ${uni}`;
      entry += yr;
      eduItems.push(entry);
      break;
    }

    // Diploma
    const dipM =
      /(Diploma\s+in\s+[\w\s&]+?)(?=\s+(?:20\d{2}|ESOFT|ICBT|Metro|February|,|\())/i.exec(
        textEdu,
      );
    if (dipM) {
      const yrM = /(20\d{2})/.exec(textEdu.slice(dipM.index, dipM.index + 80));
      eduItems.push(dipM[1].trim() + (yrM ? ` (${yrM[1]})` : ''));
    }

    // A-Level
    const alM =
      /(G\.?C\.?E\.?\s*(?:Advanced|Ordinary)\s*Level[^|(.\n]{0,50})/i.exec(
        textEdu,
      );
    if (alM) {
      let entry = alM[1].trim().replace(/,\s*$/, '');
      const resM = /Results?\s*:\s*[A-E][,\sA-E]{0,12}/i.exec(
        textEdu.slice(alM.index),
      );
      if (resM) entry += ` | ${resM[0].trim()}`;
      eduItems.push(entry);
    }

    const education = eduItems.join(' | ');

    // 6 ── PROJECTS ───────────────────────────────────────────────────────────
    // Nimaya's projects appear before WORK EXPERIENCE in text stream
    let projBlock = this.findSection(text, 'PROJECTS');
    if (!projBlock || projBlock.length < 50) {
      const wiIdx = text.indexOf('WORK EXPERIENCE');
      if (wiIdx > 0) projBlock = text.slice(0, wiIdx);
    }

    const projItems: string[] = [];
    if (projBlock) {
      // Find ALL project name positions first, then process each in order
      // This avoids regex lastIndex getting corrupted between matches
      const PROJ_NAME_RE =
        /([A-Z][A-Za-z0-9\s\-–']+?)(?=\s+(?:Contributed|Collaborated|Developed|Designed|Redesigned|In this|Created|Built|Their))/g;
      const allMatches: RegExpExecArray[] = [];
      let pm: RegExpExecArray | null;
      while ((pm = PROJ_NAME_RE.exec(projBlock)) !== null) {
        allMatches.push(pm);
      }

      const TECH_WORDS =
        /^(?:Auth0|MongoDB|GoLang|Angular|React|Node\.js|Flask|Python|Java|MySQL|Firebase|CSS|HTML|JavaScript|TypeScript|Docker|AWS|Figma)\s+/i;
      const SECTION_HEADERS =
        /^(?:PROJECTS|EDUCATION|SKILLS|EXPERIENCE|WORK|PROFILE|EXTRA)$/i;

      for (let i = 0; i < allMatches.length; i++) {
        const match = allMatches[i];
        let rawName = match[1].trim();

        // Skip section headers and too-short/long names
        if (rawName.length < 4 || rawName.length > 80) continue;
        if (SECTION_HEADERS.test(rawName)) continue;

        // Strip tech-word prefix that leaked from previous project's Tech Stack line
        // e.g. "Auth0 WinWay.lk Digital Lottery Platform" → "WinWay.lk Digital Lottery Platform"
        rawName = rawName.replace(TECH_WORDS, '').trim();
        if (rawName.length < 4) continue;

        // Limit "after" to between this match and the NEXT project name (prevents bleed-through)
        const zoneStart = match.index + match[0].length;
        const zoneEnd =
          allMatches[i + 1]?.index ??
          Math.min(zoneStart + 350, projBlock.length);
        const after = projBlock.slice(zoneStart, zoneEnd);

        // Tech stack: take only the clean comma-separated list, stop at end-of-segment
        const tsM = /Tech(?:\s+Stack)?[:\s-]+([^.\n|]{3,80})/i.exec(after);
        let ts = '';
        if (tsM) {
          let tsVal = tsM[1].trim();
          // Remove trailing project-name noise ("Loyalty Management System...")
          tsVal = tsVal
            .replace(
              /\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\s*(?:–|System|Platform|App|Project).*$/,
              '',
            )
            .trim();
          ts = ` Tech: ${tsVal}`;
        }

        const bM =
          /((?:Contributed|Collaborated|Developed|Designed|In this|Created|Built|Their)[^.]{10,150}\.)/i.exec(
            after,
          );
        const desc = bM ? bM[1].trim() : '';

        if (desc || ts) projItems.push(`${rawName}: ${desc}${ts}`);
      }
    }
    const projects = projItems.slice(0, 6).join(' | ');

    // 7 ── Populate fields ────────────────────────────────────────────────────
    this.resume = { skills, experience, education, projects };
  }

  resetUpload() {
    this.uploadState = 'idle';
    this.uploadedFileName = '';
    this.uploadError = '';
    this.resume = { skills: '', experience: '', education: '', projects: '' };
  }

  assess() {
    if (!this.resume.skills?.trim() || !this.resume.experience?.trim()) {
      this.error =
        'Skills and Experience are required. Please fill in or upload a resume.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.result = null;
    this._resetXai();
    this.api.assessResume(this.resume).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        if (res.explanation?.overall_verdict) {
          this._startXaiAnimation(
            res.explanation.overall_verdict,
            res.explanation.strengths.length + res.explanation.concerns.length,
          );
        }
      },
      error: (err) => {
        this.error =
          err?.error?.detail ||
          'Assessment failed. Make sure the backend is running on port 8000.';
        this.loading = false;
      },
    });
  }

  // ── XAI typewriter engine ─────────────────────────────────────────────────

  private _resetXai() {
    clearTimeout(this._typeTimer);
    clearTimeout(this._itemTimer);
    this.xaiTypedText = '';
    this.xaiTypingDone = false;
    this.xaiItemsVisible = 0;
    this.xaiChartVisible = false;
  }

  private _startXaiAnimation(verdict: string, totalItems: number) {
    // Phase 1: type the verdict text character by character
    let idx = 0;
    const typeChar = () => {
      if (idx < verdict.length) {
        this.xaiTypedText += verdict[idx++];
        // Vary speed slightly — faster on spaces, slower on punctuation
        const ch = verdict[idx - 1];
        const delay = ch === ' ' ? 18 : ch === '.' || ch === ',' ? 90 : 28;
        this._typeTimer = setTimeout(typeChar, delay);
      } else {
        // Phase 2: cursor blinks once, then hide it and start item reveals
        this.xaiTypingDone = false; // keep cursor visible briefly
        this._typeTimer = setTimeout(() => {
          this.xaiTypingDone = true; // hide cursor
          this._revealItems(totalItems);
        }, 500);
      }
    };
    // Small initial pause before typing starts
    this._typeTimer = setTimeout(typeChar, 300);
  }

  private _revealItems(total: number) {
    // Phase 3: reveal each strength/concern item with staggered delay
    if (this.xaiItemsVisible < total) {
      this.xaiItemsVisible++;
      this._itemTimer = setTimeout(
        () => this._revealItems(total),
        120, // 120ms between each item appearing
      );
    } else {
      // Phase 4: after all items, show SHAP chart
      this._itemTimer = setTimeout(() => {
        this.xaiChartVisible = true;
      }, 200);
    }
  }

  // ── Report download ───────────────────────────────────────────────────────

  downloadReport() {
    if (!this.result || this.downloadingReport) return;
    this.downloadingReport = true;

    this.api.downloadReport(this.result, this.resume).subscribe({
      next: (blob: Blob) => {
        // Create an invisible anchor, trigger click, then remove it
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credify_report_${this.result!.resume_id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.downloadingReport = false;
      },
      error: (err) => {
        console.error('Report download failed:', err);
        this.downloadingReport = false;
        alert('Report generation failed. Make sure the backend is running.');
      },
    });
  }

  ngOnDestroy() {
    clearTimeout(this._typeTimer);
    clearTimeout(this._itemTimer);
  }

  clearForm() {
    this.resume = { skills: '', experience: '', education: '', projects: '' };
    this.result = null;
    this.error = null;
    this.uploadState = 'idle';
    this.uploadedFileName = '';
    this._resetXai();
  }

  loadSample(type: 'credible' | 'suspicious' | 'false') {
    const samples: Record<string, ResumeInput> = {
      credible: {
        skills:
          'Python, Django, PostgreSQL, Docker, REST APIs, Git, AWS, Redis',
        experience:
          'Software Engineer at TCS (Jan 2022 – Present). Developed Python microservices serving 50K daily users, reducing API latency by 35%. Led migration of 3 legacy services to Docker, improving deployment frequency by 200%. | Junior Developer at Infosys (Jun 2020 – Dec 2021). Built REST APIs and unit test suites increasing code coverage from 40% to 75%. Implemented caching layer reducing database load by 30%.',
        education:
          'B.Tech. Computer Science, VIT University Vellore (2016–2020) | GPA 3.7/4.0',
        projects:
          'Analytics Dashboard: Built real-time data visualisation platform serving 20K users with 98% uptime. Tech: Python, React, PostgreSQL, Redis | Inventory System: Developed warehouse management tool reducing stock discrepancy by 45%. Tech: Django, PostgreSQL, Docker',
      },
      suspicious: {
        skills:
          'Java, Spring Boot, Hibernate, MySQL, REST APIs, Git, Maven, JIRA',
        experience:
          'Application Developer at IBM India (Feb 2022 – Present). Responsible for developing Java applications using modern technologies. Collaborated with team members to deliver features on time. Participated in daily standups and sprint planning.',
        education: 'MCA, University of Mumbai (2017–2020)',
        projects: '',
      },
      false: {
        skills:
          'Python, Java, React, Node.js, AWS, Kubernetes, TensorFlow, Docker, Go, Blockchain, Web3, IoT',
        experience:
          'VP Engineering at Infosys (Mar 2019 – Jan 2021). Single-handedly built platform serving 450M users globally. | Director of Engineering at TCS (Feb 2019 – Dec 2020). Built services processing 50B records daily.',
        education: 'B.E. Computer Science, IIT Bombay (2022–2027)',
        projects: 'Python/React Platform: 200M users. 450% growth at launch.',
      },
    };
    this.resume = { ...samples[type] };
    this.result = null;
    this.error = null;
    this.tab = 'text';
  }
}
