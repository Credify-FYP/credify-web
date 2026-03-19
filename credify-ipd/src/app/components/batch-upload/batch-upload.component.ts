// src/app/components/batch-upload/batch-upload.component.ts
// FIXES:
//   TC-26: CSV parsing was broken — only reading first column header match.
//          Now uses robust header detection (case-insensitive, trimmed).
//          Added "Projects" textarea to manual form (was missing).
//          Added CSV column validation with clear error message.

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ResumeInput, AssessmentResult } from '../../models/resume.model';

@Component({
  selector: 'app-batch-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="batch-page">
      <div class="page-header fade-in-up">
        <div class="section-label">BATCH PROCESSING</div>
        <h1 class="page-title">Batch Resume Assessment</h1>
        <p class="page-sub">Upload a CSV file with multiple resumes or add them manually. Results exportable as CSV.</p>
      </div>

      <div class="batch-layout">

        <!-- ── LEFT: INPUT PANEL ────────────────────────── -->
        <div class="upload-panel fade-in-up" style="animation-delay:0.1s">

          <h3 class="panel-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            Upload CSV File
          </h3>

          <!-- CSV column spec -->
          <div class="csv-spec">
            CSV must have these 4 columns in the header row:
            <div class="csv-cols">
              <span class="col-tag">skills</span>
              <span class="col-sep">·</span>
              <span class="col-tag">experience</span>
              <span class="col-sep">·</span>
              <span class="col-tag">education</span>
              <span class="col-sep">·</span>
              <span class="col-tag">projects</span>
            </div>
          </div>

          <!-- Drop zone -->
          <div class="drop-zone"
            [class.drag-over]="isDragging"
            [class.has-file]="!!file"
            (dragover)="onDragOver($event)"
            (dragleave)="isDragging=false"
            (drop)="onDrop($event)"
            (click)="!file && csvInput.click()">
            <input #csvInput type="file" accept=".csv" style="display:none" (change)="onFileSelect($event)">

            <div *ngIf="!file">
              <div class="dz-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <p class="dz-title">Drop CSV here</p>
              <p class="dz-sub">or click to browse</p>
            </div>

            <div class="file-badge" *ngIf="file" (click)="$event.stopPropagation()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <div class="fb-text">
                <p class="f-name">{{ file.name }}</p>
                <p class="f-meta">{{ resumeInputs.length }} resume{{ resumeInputs.length !== 1 ? 's' : '' }} parsed</p>
              </div>
              <button class="rm-btn" (click)="removeFile($event)">✕</button>
            </div>
          </div>

          <!-- CSV parse error -->
          <div class="parse-error" *ngIf="csvError">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span [innerHTML]="csvError"></span>
          </div>

          <!-- Template download -->
          <button class="ghost-btn" style="width:100%;justify-content:center" (click)="downloadTemplate()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download CSV Template
          </button>

          <div class="divider-or"><span>or add manually</span></div>

          <!-- ── MANUAL ADD FORM (all 4 fields) ─────────── -->
          <div class="manual-area">
            <div class="field-group">
              <label class="field-label">
                Skills <span class="req">*</span>
              </label>
              <textarea class="cf-textarea" rows="2"
                [(ngModel)]="manualSkills"
                placeholder="Python, Django, PostgreSQL, Docker, REST APIs..."></textarea>
            </div>

            <div class="field-group">
              <label class="field-label">
                Work Experience <span class="req">*</span>
              </label>
              <textarea class="cf-textarea" rows="4"
                [(ngModel)]="manualExp"
                placeholder="Software Engineer at TCS (Jan 2022 – Present). Developed microservices..."></textarea>
            </div>

            <div class="field-group">
              <label class="field-label">
                Education
              </label>
              <textarea class="cf-textarea" rows="2"
                [(ngModel)]="manualEdu"
                placeholder="B.Tech. Computer Science, VIT University (2018–2022) | GPA 3.7"></textarea>
            </div>

            <!-- ✅ FIX: Projects field was missing — now added -->
            <div class="field-group">
              <label class="field-label">
                Projects <span class="optional">(optional)</span>
              </label>
              <textarea class="cf-textarea" rows="2"
                [(ngModel)]="manualProjects"
                placeholder="Python/React Dashboard: Real-time analytics. 20K users. 98% uptime."></textarea>
            </div>

            <!-- Manual add error -->
            <div class="parse-error" *ngIf="manualError">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {{ manualError }}
            </div>

            <button class="ghost-btn" style="width:100%;justify-content:center" (click)="addManual()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add to Queue ({{ resumeInputs.length }})
            </button>
          </div>

          <!-- ── QUEUE LIST ───────────────────────────────── -->
          <div class="queue-list" *ngIf="resumeInputs.length">
            <div class="queue-header">
              <span class="queue-count">{{ resumeInputs.length }} resume{{ resumeInputs.length !== 1 ? 's' : '' }} queued</span>
              <button class="rm-btn" (click)="clearQueue()">Clear all</button>
            </div>
            <div class="queue-item" *ngFor="let r of resumeInputs; let i = index">
              <span class="qi-num">#{{ i + 1 }}</span>
              <div class="qi-info">
                <span class="qi-skills">{{ r.skills?.slice(0, 45) }}{{ (r.skills?.length ?? 0) > 45 ? '…' : '' }}</span>
                <span class="qi-meta">
                  {{ r.experience ? r.experience.slice(0, 30) + '…' : 'No experience' }}
                  · {{ r.projects ? 'Has projects' : 'No projects' }}
                </span>
              </div>
              <button class="rm-btn" (click)="removeFromQueue(i)">✕</button>
            </div>
          </div>

          <!-- Run button error -->
          <div class="parse-error" *ngIf="runError">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {{ runError }}
          </div>

          <!-- Run button -->
          <button class="orange-btn run-btn"
            (click)="runBatch()"
            [disabled]="loading || !resumeInputs.length">
            <span class="spinner" *ngIf="loading"></span>
            <svg *ngIf="!loading" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            {{ loading
              ? 'Processing ' + processed + '/' + resumeInputs.length + '...'
              : 'Run Batch Assessment' }}
          </button>

        </div>

        <!-- ── RIGHT: RESULTS PANEL ─────────────────────── -->
        <div class="results-panel fade-in-up" style="animation-delay:0.15s">

          <!-- Results header -->
          <div class="results-header" *ngIf="results.length && !loading">
            <div>
              <h3 class="panel-title">Results</h3>
              <p class="panel-sub">{{ results.length }} resume{{ results.length !== 1 ? 's' : '' }} assessed</p>
            </div>
            <div class="summary-pills">
              <span class="pill green">✓ {{ summary.credible }}  Credible</span>
              <span class="pill yellow">⚠ {{ summary.suspicious }} Suspicious</span>
              <span class="pill red">✕ {{ summary.false }}  False</span>
            </div>
            <button class="orange-btn export-btn" (click)="exportCsv()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Export CSV
            </button>
          </div>

          <!-- Empty state -->
          <div class="batch-empty" *ngIf="!results.length && !loading">
            <div class="be-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            </div>
            <p class="empty-title">No batch results yet</p>
            <p class="empty-sub">Upload a CSV or add resumes manually, then click Run.</p>
          </div>

          <!-- Progress -->
          <div class="progress-wrap" *ngIf="loading">
            <div class="prog-track">
              <div class="prog-fill" [style.width.%]="resumeInputs.length ? (processed / resumeInputs.length) * 100 : 0"></div>
            </div>
            <p class="prog-text">Assessed {{ processed }} of {{ resumeInputs.length }} resumes...</p>
          </div>

          <!-- Result rows -->
          <div class="result-rows" *ngIf="results.length">
            <div class="result-row" *ngFor="let r of results; let i = index"
              [ngClass]="r.credibility_label.toLowerCase()">

              <div class="rr-num">#{{ i + 1 }}</div>

              <div class="rr-verdict">
                <span class="verdict-badge" [ngClass]="r.credibility_label.toLowerCase()">
                  {{ r.credibility_label }}
                </span>
                <span class="rr-conf">{{ (r.confidence_score * 100).toFixed(0) }}% conf</span>
              </div>

              <div class="rr-signals">
                <span class="sig-pill" [ngClass]="r.signal_breakdown.timeline_validation.timeline_overlap ? 'bad':'ok'">
                  TL: {{ r.signal_breakdown.timeline_validation.timeline_overlap ? '✕' : '✓' }}
                </span>
                <span class="sig-pill" [ngClass]="r.signal_breakdown.evidence_verification.has_projects ? 'ok':'warn'">
                  PR: {{ r.signal_breakdown.evidence_verification.has_projects ? '✓' : '✕' }}
                </span>
                <span class="sig-pill" [ngClass]="r.signal_breakdown.timeline_validation.future_grad_year ? 'bad':'ok'">
                  FG: {{ r.signal_breakdown.timeline_validation.future_grad_year ? '✕' : '✓' }}
                </span>
              </div>

              <div class="rr-bars">
                <div class="rr-bar" *ngFor="let cls of ['credible','suspicious','false']">
                  <span class="rr-bar-lbl">{{ cls[0].toUpperCase() }}</span>
                  <div class="rr-bar-track">
                    <div class="rr-bar-fill" [ngClass]="'fill-'+cls"
                      [style.width.%]="getScore(r, cls) * 100"></div>
                  </div>
                  <span class="rr-bar-pct">{{ (getScore(r, cls) * 100).toFixed(0) }}%</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .batch-page { max-width: 1200px; margin: 0 auto; padding: 48px 24px 80px; }
    .page-header { margin-bottom: 40px; }
    .page-title { font-size: 2rem; font-weight: 800; margin: 10px 0 12px; letter-spacing: -0.01em; }
    .page-sub { color: var(--text-secondary); font-size: 0.95rem; }

    .batch-layout { display: grid; grid-template-columns: 400px 1fr; gap: 24px; align-items: start; }
    @media(max-width:960px) { .batch-layout { grid-template-columns: 1fr; } }

    .upload-panel, .results-panel { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 24px; display: flex; flex-direction: column; gap: 14px; }

    .panel-title { font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0; color: var(--text-primary); }
    .panel-sub { font-size: 0.8rem; color: var(--text-muted); margin: 0; }

    /* CSV spec */
    .csv-spec { font-size: 0.78rem; color: var(--text-muted); line-height: 1.6; }
    .csv-cols { display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
    .col-tag { background: var(--bg-card2); border: 1px solid var(--border); border-radius: 5px; padding: 3px 8px; font-family: 'Space Mono', monospace; font-size: 0.72rem; color: var(--orange-bright); font-weight: 600; }
    .col-sep { color: var(--text-muted); }

    /* Drop zone */
    .drop-zone { border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 28px 16px; text-align: center; cursor: pointer; transition: all 0.2s;
      &:hover, &.drag-over { border-color: var(--orange); background: var(--orange-glow); }
      &.has-file { padding: 16px; cursor: default; }
    }
    .dz-icon { width: 48px; height: 48px; background: var(--bg-card2); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: var(--text-muted); }
    .dz-title { font-weight: 600; font-size: 0.88rem; margin-bottom: 3px; color: var(--text-primary); }
    .dz-sub { font-size: 0.75rem; color: var(--text-muted); }

    .file-badge { display: flex; align-items: center; gap: 10px; text-align: left; }
    .fb-text { flex: 1; }
    .f-name { font-weight: 600; font-size: 0.85rem; color: var(--text-primary); }
    .f-meta { font-size: 0.73rem; color: var(--text-muted); margin-top: 2px; }
    .rm-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 0.85rem; flex-shrink: 0; &:hover { background: var(--red-bg); color: var(--red); } }

    /* Errors */
    .parse-error { display: flex; align-items: flex-start; gap: 8px; background: var(--red-bg); border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius); padding: 10px 13px; color: var(--red); font-size: 0.8rem; line-height: 1.5; svg { flex-shrink: 0; margin-top: 1px; } }

    /* Divider */
    .divider-or { display: flex; align-items: center; gap: 10px; font-size: 0.72rem; color: var(--text-muted); &::before, &::after { content: ''; flex: 1; height: 1px; background: var(--border); } }

    /* Manual form */
    .manual-area { display: flex; flex-direction: column; gap: 12px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 5px; }
    .req { color: var(--orange); }
    .optional { color: var(--text-muted); font-weight: 400; font-size: 0.75rem; }
    .cf-textarea { width: 100%; background: var(--bg-card2); border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 12px; color: var(--text-primary); font-family: 'DM Sans', sans-serif; font-size: 0.85rem; line-height: 1.55; resize: vertical;
      &:focus { outline: none; border-color: var(--orange); box-shadow: 0 0 0 3px rgba(255,107,26,0.09); }
      &::placeholder { color: var(--text-muted); }
    }

    /* Queue list */
    .queue-list { background: var(--bg-card2); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
    .queue-header { display: flex; justify-content: space-between; align-items: center; padding: 9px 13px; border-bottom: 1px solid var(--border); }
    .queue-count { font-size: 0.75rem; font-weight: 600; color: var(--orange-bright); font-family: 'Space Mono', monospace; }
    .queue-item { display: flex; align-items: center; gap: 10px; padding: 9px 13px; border-bottom: 1px solid var(--border); &:last-child { border-bottom: none; } }
    .qi-num { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--text-muted); width: 22px; flex-shrink: 0; }
    .qi-info { flex: 1; min-width: 0; }
    .qi-skills { display: block; font-size: 0.78rem; color: var(--text-secondary); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .qi-meta { display: block; font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Run button */
    .run-btn { width: 100%; justify-content: center; padding: 13px; font-size: 0.92rem; }
    .spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Results panel */
    .results-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding-bottom: 14px; border-bottom: 1px solid var(--border); margin-bottom: 4px; }
    .summary-pills { display: flex; gap: 7px; flex-wrap: wrap; flex: 1; }
    .pill { padding: 5px 11px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; font-family: 'Space Mono', monospace; white-space: nowrap; }
    .pill.green  { background: var(--green-bg);  color: var(--green); }
    .pill.yellow { background: var(--yellow-bg); color: var(--yellow); }
    .pill.red    { background: var(--red-bg);    color: var(--red); }
    .export-btn { padding: 8px 16px; font-size: 0.8rem; flex-shrink: 0; }

    .batch-empty { text-align: center; padding: 56px 20px; }
    .be-icon { width: 60px; height: 60px; background: var(--bg-card2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; color: var(--text-muted); }
    .empty-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; color: var(--text-primary); }
    .empty-sub { font-size: 0.83rem; color: var(--text-muted); }

    .progress-wrap { padding: 16px 0; }
    .prog-track { height: 5px; background: var(--bg-card2); border-radius: 3px; overflow: hidden; margin-bottom: 10px; }
    .prog-fill { height: 100%; background: linear-gradient(90deg, var(--orange), var(--orange-bright)); border-radius: 3px; transition: width 0.3s ease; }
    .prog-text { font-size: 0.78rem; font-family: 'Space Mono', monospace; color: var(--text-muted); }

    .result-rows { display: flex; flex-direction: column; gap: 9px; max-height: 680px; overflow-y: auto; }
    .result-row { background: var(--bg-card2); border: 1px solid var(--border); border-radius: var(--radius); padding: 13px 14px; display: grid; grid-template-columns: 28px auto auto auto; gap: 12px; align-items: center;
      &.credible   { border-left: 3px solid var(--green); }
      &.suspicious { border-left: 3px solid var(--yellow); }
      &.false      { border-left: 3px solid var(--red); }
    }
    .rr-num { font-family: 'Space Mono', monospace; font-size: 0.68rem; color: var(--text-muted); }
    .rr-verdict { display: flex; flex-direction: column; gap: 3px; min-width: 88px; }
    .verdict-badge { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 0.68rem; font-weight: 700; font-family: 'Space Mono', monospace;
      &.credible   { background: var(--green-bg);  color: var(--green); }
      &.suspicious { background: var(--yellow-bg); color: var(--yellow); }
      &.false      { background: var(--red-bg);    color: var(--red); }
    }
    .rr-conf { font-size: 0.67rem; color: var(--text-muted); font-family: 'Space Mono', monospace; }
    .rr-signals { display: flex; gap: 4px; }
    .sig-pill { font-size: 0.62rem; font-family: 'Space Mono', monospace; padding: 3px 6px; border-radius: 4px; font-weight: 700;
      &.ok   { background: var(--green-bg);  color: var(--green); }
      &.warn { background: var(--yellow-bg); color: var(--yellow); }
      &.bad  { background: var(--red-bg);    color: var(--red); }
    }
    .rr-bars { display: flex; flex-direction: column; gap: 3px; min-width: 110px; }
    .rr-bar { display: flex; align-items: center; gap: 5px; }
    .rr-bar-lbl { font-size: 0.62rem; font-family: 'Space Mono', monospace; color: var(--text-muted); width: 9px; flex-shrink: 0; }
    .rr-bar-track { flex: 1; height: 4px; background: var(--bg-base); border-radius: 2px; overflow: hidden; }
    .rr-bar-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
    .fill-credible   { background: var(--green); }
    .fill-suspicious { background: var(--yellow); }
    .fill-false      { background: var(--red); }
    .rr-bar-pct { font-size: 0.6rem; font-family: 'Space Mono', monospace; color: var(--text-muted); width: 26px; text-align: right; }
  `]
})
export class BatchUploadComponent {
  file: File | null = null;
  resumeInputs: ResumeInput[] = [];
  results: AssessmentResult[] = [];
  loading = false;
  processed = 0;
  csvError: string | null = null;
  manualError: string | null = null;
  runError: string | null = null;
  isDragging = false;
  summary = { credible: 0, suspicious: 0, false: 0 };

  // Manual form fields — now includes Projects
  manualSkills   = '';
  manualExp      = '';
  manualEdu      = '';
  manualProjects = '';

  constructor(private api: ApiService) {}

  getScore(r: AssessmentResult, cls: string): number {
    return r.class_scores[cls as keyof typeof r.class_scores] ?? 0;
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging = true; }

  onDrop(e: DragEvent) {
    e.preventDefault(); this.isDragging = false;
    const f = e.dataTransfer?.files[0];
    if (f) this.processFile(f);
  }

  onFileSelect(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (f) this.processFile(f);
  }

  processFile(f: File) {
    this.csvError = null;
    this.file = f;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.parseCSV(text);
    };
    reader.readAsText(f, 'utf-8');
  }

  /**
   * Robust CSV parser:
   * - Case-insensitive column header matching
   * - Trims whitespace and quotes from all values
   * - Validates that required columns exist
   * - Shows clear error if columns are missing
   */
  parseCSV(text: string) {
    this.csvError = null;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length < 2) {
      this.csvError = 'CSV file is empty or has only a header row. Add at least one data row.';
      this.file = null;
      return;
    }

    // Parse headers — strip BOM, quotes, extra spaces, lowercase
    const rawHeaders = lines[0]
      .replace(/^\uFEFF/, '')          // strip UTF-8 BOM
      .split(',')
      .map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase().trim());

    // Find column indices (case-insensitive)
    const idx = {
      skills:     rawHeaders.findIndex(h => h === 'skills'),
      experience: rawHeaders.findIndex(h => h === 'experience'),
      education:  rawHeaders.findIndex(h => h === 'education'),
      projects:   rawHeaders.findIndex(h => h === 'projects'),
    };

    // Validate required columns exist
    const missing: string[] = [];
    if (idx.skills     < 0) missing.push('<code>skills</code>');
    if (idx.experience < 0) missing.push('<code>experience</code>');

    if (missing.length > 0) {
      this.csvError = `Missing required column(s): ${missing.join(', ')}. `
        + `Found headers: ${rawHeaders.join(', ')}. `
        + `Download the template to see the correct format.`;
      this.file = null;
      return;
    }

    // Parse data rows
    const parsed: ResumeInput[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = this.splitCsvLine(lines[i]);
      const get = (colIdx: number) =>
        colIdx >= 0 && colIdx < vals.length
          ? vals[colIdx].trim().replace(/^["']|["']$/g, '').trim()
          : '';

      const skills     = get(idx.skills);
      const experience = get(idx.experience);

      // Skip rows with no useful data
      if (!skills && !experience) continue;

      parsed.push({
        skills,
        experience,
        education: get(idx.education),
        projects:  get(idx.projects),
      });
    }

    if (parsed.length === 0) {
      this.csvError = 'No valid data rows found. Make sure the CSV has data rows below the header.';
      this.file = null;
      return;
    }

    this.resumeInputs = [...this.resumeInputs, ...parsed];
  }

  /** Split a CSV line respecting quoted fields */
  private splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  addManual() {
    this.manualError = null;
    if (!this.manualSkills.trim() && !this.manualExp.trim()) {
      this.manualError = 'Please provide at least Skills or Experience before adding to queue.';
      return;
    }
    this.resumeInputs.push({
      skills:     this.manualSkills.trim(),
      experience: this.manualExp.trim(),
      education:  this.manualEdu.trim(),
      projects:   this.manualProjects.trim(),
    });
    // Clear all fields after adding
    this.manualSkills   = '';
    this.manualExp      = '';
    this.manualEdu      = '';
    this.manualProjects = '';
  }

  removeFromQueue(i: number) { this.resumeInputs.splice(i, 1); }

  clearQueue() {
    this.resumeInputs = [];
    this.file = null;
    this.csvError = null;
  }

  removeFile(e: Event) {
    e.stopPropagation();
    this.file = null;
    this.csvError = null;
    // Remove only the file-parsed entries (keep manually added ones)
    // Simple approach: clear all since we can't distinguish without tracking
    this.resumeInputs = [];
  }

  async runBatch() {
    this.runError = null;
    if (!this.resumeInputs.length) {
      this.runError = 'Queue is empty. Add resumes first.';
      return;
    }
    this.loading = true;
    this.results = [];
    this.processed = 0;
    this.summary = { credible: 0, suspicious: 0, false: 0 };

    for (const resume of this.resumeInputs) {
      await new Promise<void>((resolve) => {
        this.api.assessResume(resume).subscribe({
          next: (r) => {
            this.results.push(r);
            this.processed++;
            const key = r.credibility_label.toLowerCase() as keyof typeof this.summary;
            if (key in this.summary) this.summary[key]++;
            resolve();
          },
          error: () => { this.processed++; resolve(); }
        });
      });
    }
    this.loading = false;
  }

  exportCsv() {
    if (!this.results.length) return;
    const headers = 'Resume ID,Label,Confidence (%),Credible (%),Suspicious (%),False (%),Timeline Overlap,Future Grad,Has Projects,Skill Count,Buzzwords';
    const rows = this.results.map(r => {
      const conf = (r.confidence_score * 100).toFixed(1);
      const cred = (r.class_scores.credible   * 100).toFixed(1);
      const susp = (r.class_scores.suspicious * 100).toFixed(1);
      const fals = (r.class_scores.false      * 100).toFixed(1);
      const tl   = r.signal_breakdown.timeline_validation.timeline_overlap;
      const fg   = r.signal_breakdown.timeline_validation.future_grad_year;
      const hp   = r.signal_breakdown.evidence_verification.has_projects;
      const sc   = r.signal_breakdown.complexity_alignment.skill_count;
      const bz   = r.signal_breakdown.anomaly_detection.buzzword_count;
      return `"${r.resume_id}","${r.credibility_label}",${conf}%,${cred}%,${susp}%,${fals}%,${tl},${fg},${hp},${sc},${bz}`;
    });
    const csv  = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `credify_batch_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadTemplate() {
    const csv = [
      'skills,experience,education,projects',
      '"Python, Django, PostgreSQL, Docker, REST APIs, Git, AWS","Software Engineer at TCS (Jan 2022 – Present). Developed Python microservices serving 50K users. Improved performance by 35%.","B.Tech. Computer Science, VIT University (2018–2022) | GPA 3.7/4.0","Python/React Analytics Dashboard: Real-time data visualisation. 20K users. 98% uptime."',
      '"Java, Spring Boot, MySQL, REST APIs, Git","Developer at IBM India (Feb 2022 – Present). Maintained Java applications and attended sprint meetings.","MCA, University of Mumbai (2019–2022)",""',
      '"Python, Java, React, AWS, Blockchain, Web3, IoT","VP Engineering at Google (Mar 2019 – Jan 2021). Platform serving 450M users. | Director at TCS (Feb 2019 – Dec 2020). Led 300 engineers.","B.E. CS, IIT Bombay (2022–2027)","Python/React Platform: 200M users. 450% growth."',
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'credify_template.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }
}