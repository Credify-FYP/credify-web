import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-inner">
        <!-- Logo -->
        <a routerLink="/" class="logo">
          <div class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="logo-text">Credi<span class="logo-accent">Fy</span></span>
        </a>

        <!-- Nav links -->
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </a>
          <a routerLink="/assess" routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            Assess
          </a>
          <a routerLink="/batch" routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            Batch
          </a>
        </div>

        <!-- Status pill -->
        <div class="status-pill" [class.online]="apiOnline" [class.offline]="!apiOnline">
          <span class="status-dot"></span>
          {{ apiOnline ? 'API Online' : 'API Offline' }}
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10,10,15,0.85);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 40px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, var(--orange), var(--orange-dim));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 0 16px rgba(255,107,26,0.35);
    }
    .logo-text {
      font-family: 'Syne', sans-serif;
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .logo-accent { color: var(--orange); }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 8px 16px;
      border-radius: 8px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
      &:hover { color: var(--text-primary); background: var(--bg-card2); }
      &.active { color: var(--orange); background: var(--orange-glow); }
    }
    .status-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
      font-family: 'Space Mono', monospace;
      border: 1px solid var(--border);
      color: var(--text-muted);
      flex-shrink: 0;
      &.online { border-color: rgba(34,197,94,0.3); color: var(--green); background: rgba(34,197,94,0.08); }
      &.offline { border-color: rgba(239,68,68,0.3); color: var(--red); background: rgba(239,68,68,0.08); }
    }
    .status-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: currentColor;
    }
    .online .status-dot { animation: pulse-ring 1.8s infinite; }
  `]
})
export class NavbarComponent implements OnInit {
  apiOnline = false;
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.checkHealth().subscribe({
      next: () => this.apiOnline = true,
      error: () => this.apiOnline = false
    });
  }
}