// src/app/components/dashboard/dashboard.component.ts

import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dash-page">

      <!-- ── HERO ─────────────────────────────────────────── -->
      <section class="hero" #heroSection>
        <div class="hero-bg-grid"></div>
        <div class="hero-ambient"></div>
        <div class="cursor-blob"
          [style.left.px]="blobX"
          [style.top.px]="blobY"></div>

        <div class="hero-content fade-in-up">
          <div class="hero-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            ML-Powered Resume Credibility Assessment
          </div>
          <h1 class="hero-title">
            Detect Resume<br>
            <span class="gradient-text">Fraud Instantly</span>
          </h1>
          <p class="hero-sub">
            CrediFy uses <strong>Multi-Signal Consistency Analysis (MSCA)</strong> to assess
            resumes across four independent signal dimensions — trained on
            <strong>7,830&nbsp;labelled resumes</strong> with genuine structural fraud patterns.
          </p>
          <div class="hero-actions">
            <a routerLink="/assess" class="orange-btn hero-cta">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              Assess a Resume
            </a>
            <a routerLink="/batch" class="ghost-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
              Batch Upload
            </a>
          </div>
        </div>

        <div class="hero-stats fade-in-up" style="animation-delay:0.18s">
          <div class="stat-item">
            <span class="stat-num">79.11<span class="stat-unit">%</span></span>
            <span class="stat-label">Model Accuracy</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">10,100</span>
            <span class="stat-label">Training Resumes</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">4</span>
            <span class="stat-label">MSCA Signals</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">3</span>
            <span class="stat-label">Output Classes</span>
          </div>
        </div>
      </section>

      <!-- ── SIGNALS ───────────────────────────────────────── -->
      <section class="signals-section">
        <div class="section-label">HOW IT WORKS</div>
        <h2 class="section-title">Four Detection Signals</h2>
        <p class="section-sub">Each resume is independently scored across four MSCA signal dimensions before a final credibility label is assigned.</p>
        <div class="signals-grid">
          <div class="signal-card fade-in-up"
            *ngFor="let s of signals; let i = index"
            [style.animation-delay]="(i * 0.07) + 's'">
            <div class="signal-icon" [style.--c]="s.color">
              <span [innerHTML]="s.icon"></span>
            </div>
            <div class="signal-tag">{{ s.tag }}</div>
            <h3 class="signal-name">{{ s.name }}</h3>
            <p class="signal-desc">{{ s.desc }}</p>
            <div class="signal-checks">
              <div class="check-item" *ngFor="let c of s.checks">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                {{ c }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── OUTPUT CLASSES ────────────────────────────────── -->
      <section class="classes-section">
        <div class="section-label">OUTPUT LABELS</div>
        <h2 class="section-title">Three Credibility Classes</h2>
        <div class="classes-row">
          <div class="class-card credible">
            <div class="class-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3>Credible</h3>
            <p>Consistent timeline, realistic claims and specific achievements backed by documented projects. No fraud signals detected across all four dimensions.</p>
            <div class="class-tags">
              <span>✓ Clean dates</span><span>✓ Projects present</span><span>✓ No inflation</span>
            </div>
          </div>
          <div class="class-card suspicious">
            <div class="class-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3>Suspicious</h3>
            <p>Vague or unsubstantiated content. Missing projects, generic descriptions, or skill sets inconsistent with the stated experience level.</p>
            <div class="class-tags">
              <span>⚠ Vague language</span><span>⚠ No projects</span><span>⚠ Low specificity</span>
            </div>
          </div>
          <div class="class-card false">
            <div class="class-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3>False</h3>
            <p>Clear fraud signals: overlapping employment dates, future graduation years, impossible seniority jumps, or heavily inflated metrics.</p>
            <div class="class-tags">
              <span>✕ Date overlap</span><span>✕ Future grad</span><span>✕ Inflated claims</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── MODEL CARD ────────────────────────────────────── -->
      <section class="model-section" *ngIf="modelInfo">
        <div class="model-card fade-in-up">
          <div class="model-left">
            <div class="section-label">MODEL INFO</div>
            <h2 class="model-title">Random Forest Classifier</h2>
            <p class="model-desc">
              Trained on CAD-S v7 Production — 10,100 resumes with fully shared vocabulary
              and number ranges across all label classes, eliminating data leakage.
              Stratified 70/15/15 train/val/test split with no test-set contamination.
            </p>
          </div>
          <div class="model-metrics">
            <div class="metric-box">
              <span class="metric-val">{{ (modelInfo.best_test_accuracy * 100).toFixed(2) }}%</span>
              <span class="metric-key">Test Accuracy</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">{{ modelInfo.best_f1_macro?.toFixed(4) }}</span>
              <span class="metric-key">F1 Macro</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">300</span>
              <span class="metric-key">Trees</span>
            </div>
            <div class="metric-box">
              <span class="metric-val">{{ modelInfo.sklearn_version }}</span>
              <span class="metric-key">sklearn</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── CTA ───────────────────────────────────────────── -->
      <section class="cta-section">
        <div class="cta-card fade-in-up">
          <div class="cta-glow"></div>
          <div class="cta-content">
            <h2 class="cta-title">Ready to verify a resume?</h2>
            <p class="cta-sub">Paste or upload a resume and get instant credibility analysis with full signal-level breakdown and class probabilities.</p>
            <div class="cta-actions">
              <a routerLink="/assess" class="orange-btn" style="font-size:1rem;padding:14px 40px">
                Start Assessment →
              </a>
              <a routerLink="/batch" class="ghost-btn" style="padding:14px 28px">
                Try Batch Mode
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .dash-page { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 px 100px; }

    /* ── Hero ──────────────────────────────── */
    .hero { position: relative; padding: 88px 0 60px; overflow: hidden; }

    .hero-bg-grid {
      position: absolute; inset: 0; pointer-events: none;
      background-image:
        linear-gradient(rgba(255,107,26,0.032) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,107,26,0.032) 1px, transparent 1px);
      background-size: 52px 52px;
      mask-image: radial-gradient(ellipse at 50% 0%, black 25%, transparent 72%);
    }

    .hero-ambient {
      position: absolute; top: -160px; left: 50%; transform: translateX(-50%);
      width: 700px; height: 480px; pointer-events: none; z-index: 0;
      // background: radial-gradient(ellipse, rgba(255,107,26,0.07) 0%, transparent 65%);
    }

    /* CURSOR BLOB */
    .cursor-blob {
      position: absolute;
      width: 540px; height: 540px;
      background: radial-gradient(circle,
        rgba(255,107,26,0.13) 0%,
        rgba(255,107,26,0.04) 40%,
        transparent 68%);
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: left 0.10s ease-out, top 0.10s ease-out;
      z-index: 0;
      will-change: left, top;
    }

    .hero-content { position: relative; z-index: 1; max-width: 700px; }

    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 7px 16px;
      background: rgba(255,107,26,0.09);
      border: 1px solid rgba(255,107,26,0.26);
      border-radius: 999px;
      font-size: 0.77rem; font-weight: 600;
      color: #FF9052;
      font-family: 'Space Mono', monospace;
      letter-spacing: 0.025em;
      margin-bottom: 28px;
    }

    .hero-title {
      font-family: 'Syne', sans-serif;
      font-size: clamp(2.8rem, 7vw, 4.6rem);
      font-weight: 800;
      line-height: 1.07;
      letter-spacing: -0.025em;
      color: #EBEBF0;
      margin-bottom: 22px;
    }

    .hero-sub {
      font-size: 1.07rem;
      color: #8888A0;
      line-height: 1.78;
      margin-bottom: 40px;
      max-width: 580px;
      strong { color: #C0C0D0; font-weight: 600; }
    }

    .hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .hero-cta { font-size: 0.95rem; padding: 13px 30px; }

    .hero-stats {
      display: flex; align-items: center;
      margin-top: 64px; position: relative; z-index: 1;
      background: rgba(18,18,26,0.96);
      border: 1px solid rgba(255,255,255,0.068);
      border-radius: 16px; padding: 26px 0;
      width: fit-content;
      backdrop-filter: blur(14px);
    }
    .stat-item { text-align: center; padding: 0 36px; }
    .stat-num {
      display: block;
      font-family: 'Syne', sans-serif;
      font-size: 2.05rem; font-weight: 800;
      color: #FF8C42; line-height: 1; letter-spacing: -0.02em;
    }
    .stat-unit { font-size: 1.3rem; }
    .stat-label {
      display: block; font-size: 0.68rem; color: #505068; margin-top: 8px;
      font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.1em; font-family: 'Space Mono', monospace;
    }
    .stat-divider { width: 1px; height: 44px; background: rgba(255,255,255,0.065); flex-shrink: 0; }

    /* ── Sections shared ──────────────────── */
    .section-label {
      font-family: 'Space Mono', monospace;
      font-size: 0.66rem; font-weight: 700;
      color: #FF6B1A; letter-spacing: 0.16em;
      margin-bottom: 9px; text-transform: uppercase;
    }
    .section-title {
      font-family: 'Syne', sans-serif;
      font-size: 2.05rem; font-weight: 800;
      margin-bottom: 12px; letter-spacing: -0.02em; color: #EBEBF0;
    }
    .section-sub {
      font-size: 0.98rem; color: #8888A0;
      line-height: 1.72; margin-bottom: 40px; max-width: 580px;
    }

    /* ── Signals ──────────────────────────── */
    .signals-section { padding: 88px 0 48px; }
    .signals-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(255px, 1fr)); gap: 16px; }
    .signal-card {
      background: #15151D; border: 1px solid rgba(255,255,255,0.066);
      border-radius: 18px; padding: 28px;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
      &:hover { border-color: rgba(255,107,26,0.33); transform: translateY(-4px); box-shadow: 0 14px 44px rgba(0,0,0,0.48); }
    }
    .signal-icon {
      width: 46px; height: 46px; border-radius: 11px; margin-bottom: 18px;
      background: color-mix(in srgb, var(--c) 11%, transparent);
      border: 1px solid color-mix(in srgb, var(--c) 22%, transparent);
      display: flex; align-items: center; justify-content: center; color: var(--c);
      svg { width: 21px; height: 21px; stroke: currentColor; fill: none; stroke-width: 2; }
    }
    .signal-tag { font-family: 'Space Mono', monospace; font-size: 0.6rem; font-weight: 700; color: #505068; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
    .signal-name { font-family: 'Syne', sans-serif; font-size: 1.02rem; font-weight: 700; margin-bottom: 10px; color: #EBEBF0; }
    .signal-desc { font-size: 0.86rem; color: #8888A0; line-height: 1.67; margin-bottom: 18px; }
    .signal-checks { display: flex; flex-direction: column; gap: 7px; }
    .check-item { display: flex; align-items: center; gap: 9px; font-size: 0.815rem; color: #6E6E88; font-weight: 500; }

    /* ── Classes ──────────────────────────── */
    .classes-section { padding: 48px 0; }
    .classes-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(275px, 1fr)); gap: 16px; }
    .class-card {
      background: #15151D; border-radius: 18px; padding: 28px;
      border: 1px solid rgba(255,255,255,0.066);
      h3 { font-family: 'Syne', sans-serif; font-size: 1.18rem; font-weight: 800; margin: 14px 0 10px; }
      p { font-size: 0.86rem; color: #8888A0; line-height: 1.67; margin-bottom: 18px; }
      &.credible { border-top: 3px solid #22C55E; .class-icon { background: rgba(34,197,94,0.09); color: #22C55E; } h3 { color: #22C55E; } }
      &.suspicious { border-top: 3px solid #EAB308; .class-icon { background: rgba(234,179,8,0.09); color: #EAB308; } h3 { color: #EAB308; } }
      &.false { border-top: 3px solid #EF4444; .class-icon { background: rgba(239,68,68,0.09); color: #EF4444; } h3 { color: #EF4444; } }
    }
    .class-icon { width: 46px; height: 46px; border-radius: 11px; display: flex; align-items: center; justify-content: center; }
    .class-tags { display: flex; flex-wrap: wrap; gap: 7px;
      span { background: rgba(255,255,255,0.045); border: 1px solid rgba(255,255,255,0.065); border-radius: 6px; padding: 4px 10px; font-size: 0.73rem; color: #686882; font-weight: 600; font-family: 'Space Mono', monospace; }
    }

    /* ── Model ────────────────────────────── */
    .model-section { padding: 48px 0; }
    .model-card { background: #15151D; border: 1px solid rgba(255,255,255,0.066); border-radius: 20px; padding: 40px; display: flex; gap: 52px; align-items: flex-start; flex-wrap: wrap; }
    .model-left { flex: 1; min-width: 280px; }
    .model-title { font-family: 'Syne', sans-serif; font-size: 1.65rem; font-weight: 800; margin: 10px 0 14px; color: #EBEBF0; }
    .model-desc { font-size: 0.9rem; color: #8888A0; line-height: 1.74; }
    .model-metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .metric-box { background: #1C1C2A; border: 1px solid rgba(255,255,255,0.066); border-radius: 12px; padding: 20px 22px; text-align: center; min-width: 110px; }
    .metric-val { display: block; font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 800; color: #FF8C42; margin-bottom: 5px; letter-spacing: -0.01em; }
    .metric-key { font-size: 0.66rem; color: #505068; font-family: 'Space Mono', monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }

    /* ── CTA ──────────────────────────────── */
    .cta-section { padding: 48px 0 0; }
    .cta-card { position: relative; overflow: hidden; background: linear-gradient(140deg, rgba(255,107,26,0.10) 0%, rgba(255,107,26,0.03) 55%, rgba(10,10,15,0.7) 100%); border: 1px solid rgba(255,107,26,0.26); border-radius: 20px; padding: 64px 56px; }
    .cta-glow { position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 500px; height: 380px; background: radial-gradient(ellipse, rgba(255,107,26,0.12), transparent 68%); pointer-events: none; }
    .cta-content { position: relative; z-index: 1; text-align: center; }
    .cta-title { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800; margin-bottom: 14px; letter-spacing: -0.02em; color: #EBEBF0; }
    .cta-sub { font-size: 1rem; color: #8888A0; line-height: 1.74; margin-bottom: 36px; max-width: 560px; margin-left: auto; margin-right: auto; }
    .cta-actions { display: flex; justify-content: center; align-items: center; gap: 14px; flex-wrap: wrap; }

    /* Responsive */
    @media (max-width: 768px) {
      .hero { padding: 60px 0 40px; }
      .hero-stats { width: 100%; flex-wrap: wrap; justify-content: center; }
      .stat-item { padding: 12px 20px; }
      .cta-card { padding: 40px 24px; }
      .cta-title { font-size: 1.6rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  modelInfo: any = null;
  blobX = 280;
  blobY = 280;

  @ViewChild('heroSection', { static: true }) heroSection!: ElementRef<HTMLElement>;

  signals = [
    { tag: 'FR02 — Signal 1', name: 'Evidence Verification', desc: 'Cross-validates claimed achievements against documented projects and role-specific responsibilities.', icon: `<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke-linecap="round" stroke-linejoin="round"/></svg>`, color: '#22C55E', checks: ['Project presence check', 'Inflated claims detection', 'Achievement specificity'] },
    { tag: 'FR03 — Signal 2', name: 'Timeline Validation', desc: 'Detects chronological inconsistencies — overlapping employment dates and impossible graduation years.', icon: `<svg viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>`, color: '#FF6B1A', checks: ['Employment overlap detection', 'Future graduation check', 'Career gap analysis'] },
    { tag: 'FR04 — Signal 3', name: 'Complexity Alignment', desc: 'Measures whether skill breadth and quantity aligns with stated years of experience.', icon: `<svg viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke-linecap="round" stroke-linejoin="round"/></svg>`, color: '#3B82F6', checks: ['Skills-per-year ratio', 'Seniority consistency', 'Skill count plausibility'] },
    { tag: 'FR05 — Signal 4', name: 'Anomaly Detection', desc: 'Identifies statistical outliers — buzzword inflation, job count anomalies, and vague language patterns.', icon: `<svg viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke-linecap="round" stroke-linejoin="round"/></svg>`, color: '#A855F7', checks: ['Buzzword density scoring', 'Job count plausibility', 'Vagueness pattern detection'] },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getModelInfo().subscribe({ next: (i) => this.modelInfo = i, error: () => {} });
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    const hero = this.heroSection?.nativeElement;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    if (e.clientY < rect.top || e.clientY > rect.bottom) return;
    this.blobX = e.clientX - rect.left;
    this.blobY = e.clientY - rect.top;
  }
}