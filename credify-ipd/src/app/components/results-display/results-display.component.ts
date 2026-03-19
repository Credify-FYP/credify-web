// src/app/components/results-display/results-display.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { AssessmentResult } from '../../models/resume.model';

@Component({
  selector: 'app-results-display',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <mat-card class="results-card" *ngIf="result">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>assessment</mat-icon>
          Assessment Results
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>

        <!-- Score / Label Section -->
        <div class="score-section">
          <div class="score-display" [ngClass]="getLabelClass()">
            <div class="score-value">{{ (result.confidence_score * 100).toFixed(0) }}%</div>
            <div class="score-label">Confidence</div>
          </div>

          <div class="score-details">
            <mat-chip-set>
              <mat-chip [ngClass]="getLabelClass()">
                <mat-icon>{{ getLabelIcon() }}</mat-icon>
                {{ result.credibility_label }}
              </mat-chip>
              <mat-chip>ID: {{ result.resume_id }}</mat-chip>
            </mat-chip-set>

            <!-- Class probability bars -->
            <div class="prob-bars">
              <div class="prob-row" *ngFor="let cls of ['credible','suspicious','false']">
                <span class="prob-name">{{ cls | titlecase }}</span>
                <div class="prob-track">
                  <div class="prob-fill" [ngClass]="'fill-'+cls"
                    [style.width.%]="getScore(cls) * 100"></div>
                </div>
                <span class="prob-pct">{{ (getScore(cls) * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Signal Breakdown -->
        <div class="signals-section">
          <h3>MSCA Signal Breakdown</h3>
          <div class="signals-list">

            <!-- Evidence Verification -->
            <div class="signal-item" [ngClass]="result.signal_breakdown.evidence_verification.inflated_claims > 0 ? 'warn' :
              result.signal_breakdown.evidence_verification.has_projects ? 'ok' : 'warn'">
              <div class="signal-header">
                <mat-icon>verified</mat-icon>
                <span class="signal-name">Evidence Verification</span>
              </div>
              <div class="signal-values">
                <span>Projects: <b>{{ result.signal_breakdown.evidence_verification.has_projects ? 'Present' : 'Missing' }}</b></span>
                <span>Inflated Claims: <b>{{ result.signal_breakdown.evidence_verification.inflated_claims }}</b></span>
              </div>
            </div>

            <!-- Timeline Validation -->
            <div class="signal-item"
              [ngClass]="result.signal_breakdown.timeline_validation.timeline_overlap ||
                         result.signal_breakdown.timeline_validation.future_grad_year ? 'bad' : 'ok'">
              <div class="signal-header">
                <mat-icon>timeline</mat-icon>
                <span class="signal-name">Timeline Validation</span>
              </div>
              <div class="signal-values">
                <span>Date Overlap: <b>{{ result.signal_breakdown.timeline_validation.timeline_overlap ? 'Detected' : 'None' }}</b></span>
                <span>Future Grad: <b>{{ result.signal_breakdown.timeline_validation.future_grad_year ? 'Yes' : 'No' }}</b></span>
              </div>
            </div>

            <!-- Complexity Alignment -->
            <div class="signal-item neutral">
              <div class="signal-header">
                <mat-icon>psychology</mat-icon>
                <span class="signal-name">Complexity Alignment</span>
              </div>
              <div class="signal-values">
                <span>Skill Count: <b>{{ result.signal_breakdown.complexity_alignment.skill_count }}</b></span>
                <span>Skills/Year: <b>{{ result.signal_breakdown.complexity_alignment.skill_per_year.toFixed(2) }}</b></span>
              </div>
            </div>

            <!-- Anomaly Detection -->
            <div class="signal-item"
              [ngClass]="result.signal_breakdown.anomaly_detection.buzzword_count > 2 ? 'warn' : 'ok'">
              <div class="signal-header">
                <mat-icon>radar</mat-icon>
                <span class="signal-name">Anomaly Detection</span>
              </div>
              <div class="signal-values">
                <span>Buzzwords: <b>{{ result.signal_breakdown.anomaly_detection.buzzword_count }}</b></span>
                <span>Job Count: <b>{{ result.signal_breakdown.anomaly_detection.job_count }}</b></span>
              </div>
            </div>

          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="resume-info">
          <p><strong>Resume ID:</strong> {{ result.resume_id }}</p>
          <p><strong>Assessed:</strong> {{ result.timestamp | date:'medium' }}</p>
        </div>

      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .results-card { margin-top: 24px; animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    mat-card-title { display:flex; align-items:center; gap:8px; color:#1976d2; }

    .score-section { display:flex; align-items:flex-start; gap:32px; margin:24px 0; }
    .score-display { text-align:center; padding:24px; border-radius:12px; min-width:130px; color:white; }
    .score-display.credible  { background:linear-gradient(135deg,#2e7d32,#43a047); }
    .score-display.suspicious{ background:linear-gradient(135deg,#e65100,#fb8c00); }
    .score-display.false     { background:linear-gradient(135deg,#b71c1c,#e53935); }
    .score-value { font-size:42px; font-weight:700; line-height:1; }
    .score-label { font-size:13px; opacity:0.9; margin-top:6px; }
    .score-details { flex:1; }

    mat-chip.credible   { background:#e8f5e9!important; color:#2e7d32!important; }
    mat-chip.suspicious { background:#fff3e0!important; color:#e65100!important; }
    mat-chip.false      { background:#ffebee!important; color:#c62828!important; }

    .prob-bars { margin-top:16px; display:flex; flex-direction:column; gap:10px; }
    .prob-row  { display:flex; align-items:center; gap:10px; }
    .prob-name { width:90px; font-size:0.85rem; font-weight:600; color:#555; }
    .prob-track{ flex:1; height:10px; background:#e0e0e0; border-radius:5px; overflow:hidden; }
    .prob-fill { height:100%; border-radius:5px; transition:width 0.5s ease; }
    .fill-credible   { background:linear-gradient(90deg,#43a047,#66bb6a); }
    .fill-suspicious { background:linear-gradient(90deg,#ef6c00,#ffa726); }
    .fill-false      { background:linear-gradient(90deg,#c62828,#ef5350); }
    .prob-pct  { width:45px; text-align:right; font-size:0.85rem; font-weight:600; color:#333; }

    mat-divider { margin:20px 0; }
    .signals-section h3 { color:#424242; margin-bottom:16px; }
    .signals-list { display:flex; flex-direction:column; gap:12px; }
    .signal-item { padding:14px; border-radius:8px; border-left:4px solid; }
    .signal-item.ok      { background:#f1f8e9; border-color:#43a047; }
    .signal-item.warn    { background:#fff8e1; border-color:#fb8c00; }
    .signal-item.bad     { background:#ffebee; border-color:#e53935; }
    .signal-item.neutral { background:#e8eaf6; border-color:#3949ab; }
    .signal-header { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
    .signal-header mat-icon { color:#1976d2; }
    .signal-name { font-weight:600; color:#424242; }
    .signal-values { display:flex; gap:24px; font-size:0.88rem; color:#555; }

    .resume-info { background:#f9f9f9; padding:14px; border-radius:8px; }
    .resume-info p { margin:6px 0; font-size:14px; color:#424242; }
  `]
})
export class ResultsDisplayComponent {
  @Input() result!: AssessmentResult;

  getLabelClass(): string {
    return this.result.credibility_label.toLowerCase();
  }

  getLabelIcon(): string {
    const map: Record<string, string> = {
      'Credible': 'check_circle', 'Suspicious': 'warning', 'False': 'cancel'
    };
    return map[this.result.credibility_label] ?? 'help';
  }

  getScore(cls: string): number {
    const key = cls as keyof typeof this.result.class_scores;
    return this.result.class_scores[key] ?? 0;
  }
}