import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <h1>CrediFy Resume Assessment System</h1>
        <p class="subtitle">Multi-Signal Consistency Analysis for Resume Credibility Verification</p>
        <button mat-raised-button color="primary" class="cta-button" (click)="goToAssessment()">
          <mat-icon>assignment</mat-icon>
          Start Assessment
        </button>
      </div>

      <!-- Features Grid -->
      <mat-grid-list cols="2" rowHeight="280px" gutterSize="24">
        <mat-grid-tile>
          <mat-card class="feature-card">
            <mat-icon class="feature-icon evidence">verified</mat-icon>
            <h3>Evidence Verification</h3>
            <p>Validates if claimed skills are supported by concrete project evidence and work experience</p>
            <div class="feature-stat">
              <span class="stat-value">35%</span>
              <span class="stat-label">Signal Weight</span>
            </div>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="feature-card">
            <mat-icon class="feature-icon timeline">schedule</mat-icon>
            <h3>Timeline Validation</h3>
            <p>Checks if claimed years of experience are feasible based on graduation date</p>
            <div class="feature-stat">
              <span class="stat-value">30%</span>
              <span class="stat-label">Signal Weight</span>
            </div>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="feature-card">
            <mat-icon class="feature-icon complexity">speed</mat-icon>
            <h3>Complexity Alignment</h3>
            <p>Analyzes if project complexity matches claimed skill level (beginner vs expert)</p>
            <div class="feature-stat">
              <span class="stat-value">20%</span>
              <span class="stat-label">Signal Weight</span>
            </div>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="feature-card">
            <mat-icon class="feature-icon anomaly">search</mat-icon>
            <h3>Anomaly Detection</h3>
            <p>Identifies statistical red flags like excessive skills or repetitive text patterns</p>
            <div class="feature-stat">
              <span class="stat-value">15%</span>
              <span class="stat-label">Signal Weight</span>
            </div>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>

      <!-- System Info -->
      <mat-card class="info-card">
        <mat-card-header>
          <mat-card-title>System Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="info-grid">
            <div class="info-item">
              <mat-icon>info</mat-icon>
              <div>
                <strong>Version</strong>
                <p>1.0.0 - IPD Prototype</p>
              </div>
            </div>
            <div class="info-item">
              <mat-icon>model_training</mat-icon>
              <div>
                <strong>Model Type</strong>
                <p>Rule-based Multi-Signal Analysis</p>
              </div>
            </div>
            <div class="info-item">
              <mat-icon>dataset</mat-icon>
              <div>
                <strong>Dataset</strong>
                <p>7,830 Technical Resumes (CAD-S)</p>
              </div>
            </div>
            <div class="info-item">
              <mat-icon>psychology</mat-icon>
              <div>
                <strong>Future Enhancement</strong>
                <p>ML Models (Final Thesis - March 2026)</p>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- API Status -->
      <mat-card class="status-card" [ngClass]="apiStatus ? 'online' : 'offline'">
        <mat-card-content>
          <div class="status-content">
            <mat-icon>{{ apiStatus ? 'cloud_done' : 'cloud_off' }}</mat-icon>
            <div>
              <strong>Backend API Status</strong>
              <p>{{ apiStatus ? 'Connected' : 'Disconnected' }}</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .hero-section {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 16px;
      margin-bottom: 40px;
    }

    .hero-section h1 {
      font-size: 42px;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .subtitle {
      font-size: 18px;
      opacity: 0.95;
      margin-bottom: 32px;
    }

    .cta-button {
      font-size: 16px;
      padding: 12px 32px !important;
      height: auto !important;
    }

    .feature-card {
      width: 100%;
      height: 100%;
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: transform 0.2s;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .feature-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
    }

    .feature-icon.evidence { color: #4caf50; }
    .feature-icon.timeline { color: #2196f3; }
    .feature-icon.complexity { color: #ff9800; }
    .feature-icon.anomaly { color: #9c27b0; }

    .feature-card h3 {
      color: #424242;
      margin: 0 0 12px 0;
      font-size: 20px;
    }

    .feature-card p {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .feature-stat {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: auto;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #1976d2;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
    }

    .info-card {
      margin: 24px 0;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .info-item {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .info-item mat-icon {
      color: #1976d2;
      margin-top: 4px;
    }

    .info-item strong {
      display: block;
      color: #424242;
      margin-bottom: 4px;
    }

    .info-item p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .status-card {
      margin-top: 24px;
    }

    .status-card.online {
      border-left: 4px solid #4caf50;
      background-color: #f1f8f4;
    }

    .status-card.offline {
      border-left: 4px solid #f44336;
      background-color: #ffebee;
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-content mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .status-card.online mat-icon {
      color: #4caf50;
    }

    .status-card.offline mat-icon {
      color: #f44336;
    }

    .status-content strong {
      display: block;
      color: #424242;
    }

    .status-content p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit {
  apiStatus = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkApiStatus();
  }

  checkApiStatus() {
    this.apiService.checkHealth().subscribe({
      next: () => {
        this.apiStatus = true;
      },
      error: () => {
        this.apiStatus = false;
      }
    });
  }

  goToAssessment() {
    this.router.navigate(['/assess']);
  }
}