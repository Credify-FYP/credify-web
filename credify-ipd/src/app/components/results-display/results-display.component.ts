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
        <!-- Overall Score Section -->
        <div class="score-section">
          <div class="score-display" [ngClass]="getScoreClass()">
            <div class="score-value">{{ result.credibility_score.toFixed(1) }}</div>
            <div class="score-label">Credibility Score</div>
          </div>

          <div class="score-details">
            <mat-chip-set>
              <mat-chip [ngClass]="getLabelClass()">
                <mat-icon>{{ getLabelIcon() }}</mat-icon>
                {{ result.credibility_label }}
              </mat-chip>
              <mat-chip>
                Confidence: {{ result.confidence }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Signal Breakdown -->
        <div class="signals-section">
          <h3>Signal Breakdown</h3>

          <div class="signals-list">
            <div class="signal-item">
              <div class="signal-header">
                <mat-icon>verified</mat-icon>
                <span class="signal-name">Evidence Verification</span>
                <span class="signal-score">{{ result.signals.evidence_score.toFixed(1) }}%</span>
              </div>
              <div class="signal-progress">
                <div class="progress-bar" [style.width.%]="result.signals.evidence_score"></div>
              </div>
              <p class="signal-detail">{{ result.details.evidence }}</p>
            </div>

            <div class="signal-item">
              <div class="signal-header">
                <mat-icon>schedule</mat-icon>
                <span class="signal-name">Timeline Validation</span>
                <span class="signal-score">{{ result.signals.timeline_score.toFixed(1) }}%</span>
              </div>
              <div class="signal-progress">
                <div class="progress-bar" [style.width.%]="result.signals.timeline_score"></div>
              </div>
              <p class="signal-detail">{{ result.details.timeline }}</p>
            </div>

            <div class="signal-item">
              <div class="signal-header">
                <mat-icon>speed</mat-icon>
                <span class="signal-name">Complexity Alignment</span>
                <span class="signal-score">{{ result.signals.complexity_score.toFixed(1) }}%</span>
              </div>
              <div class="signal-progress">
                <div class="progress-bar" [style.width.%]="result.signals.complexity_score"></div>
              </div>
              <p class="signal-detail">{{ result.details.complexity }}</p>
            </div>

            <div class="signal-item">
              <div class="signal-header">
                <mat-icon>search</mat-icon>
                <span class="signal-name">Anomaly Detection</span>
                <span class="signal-score">{{ result.signals.anomaly_score.toFixed(1) }}%</span>
              </div>
              <div class="signal-progress">
                <div class="progress-bar" [style.width.%]="result.signals.anomaly_score"></div>
              </div>
              <p class="signal-detail">{{ result.details.anomaly }}</p>
            </div>
          </div>
        </div>

        <!-- Resume Info -->
        <mat-divider></mat-divider>
        <div class="resume-info">
          <p><strong>Resume ID:</strong> {{ result.resume_id }}</p>
          <p><strong>Candidate:</strong> {{ result.name }}</p>
          <p><strong>Assessed:</strong> {{ result.timestamp | date:'medium' }}</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .results-card {
      margin-top: 24px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
    }

    .score-section {
      display: flex;
      align-items: center;
      gap: 32px;
      margin: 24px 0;
    }

    .score-display {
      text-align: center;
      padding: 24px;
      border-radius: 12px;
      min-width: 180px;
    }

    .score-display.high {
      background: linear-gradient(135deg, #4caf50 0%, #81c784 100%);
      color: white;
    }

    .score-display.medium {
      background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
      color: white;
    }

    .score-display.low {
      background: linear-gradient(135deg, #f44336 0%, #e57373 100%);
      color: white;
    }

    .score-value {
      font-size: 48px;
      font-weight: 700;
      line-height: 1;
    }

    .score-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 8px;
    }

    .score-details {
      flex: 1;
    }

    mat-chip-set {
      display: flex;
      gap: 8px;
    }

    mat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    mat-chip.credible {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    mat-chip.suspicious {
      background-color: #fff3e0;
      color: #ef6c00;
    }

    mat-chip.false {
      background-color: #ffebee;
      color: #c62828;
    }

    mat-divider {
      margin: 24px 0;
    }

    .signals-section h3 {
      color: #424242;
      margin-bottom: 20px;
    }

    .signals-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .signal-item {
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .signal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .signal-header mat-icon {
      color: #1976d2;
    }

    .signal-name {
      flex: 1;
      font-weight: 500;
      color: #424242;
    }

    .signal-score {
      font-weight: 600;
      color: #1976d2;
    }

    .signal-progress {
      height: 8px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
      transition: width 0.5s ease-out;
    }

    .signal-detail {
      font-size: 13px;
      color: #666;
      margin: 0;
    }

    .resume-info {
      background-color: #f9f9f9;
      padding: 16px;
      border-radius: 8px;
      margin-top: 24px;
    }

    .resume-info p {
      margin: 8px 0;
      font-size: 14px;
      color: #424242;
    }
  `]
})
export class ResultsDisplayComponent {
  @Input() result!: AssessmentResult;

  getScoreClass(): string {
    if (this.result.credibility_score >= 70) return 'high';
    if (this.result.credibility_score >= 40) return 'medium';
    return 'low';
  }

  getLabelClass(): string {
    const label = this.result.credibility_label.toLowerCase();
    return label;
  }

  getLabelIcon(): string {
    switch (this.result.credibility_label) {
      case 'Credible': return 'check_circle';
      case 'Suspicious': return 'warning';
      case 'False': return 'cancel';
      default: return 'help';
    }
  }
}