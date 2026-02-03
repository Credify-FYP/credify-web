import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <mat-icon class="brand-icon">verified_user</mat-icon>
          <span class="brand-text">CrediFy</span>
          <span class="brand-subtitle">Resume Credibility Assessment</span>
        </div>
        
        <nav class="navbar-menu">
          <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </a>
          <a mat-button routerLink="/assess" routerLinkActive="active">
            <mat-icon>assignment</mat-icon>
            Single Assessment
          </a>
          <a mat-button routerLink="/batch" routerLinkActive="active">
            <mat-icon>upload_file</mat-icon>
            Batch Upload
          </a>
        </nav>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .navbar-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .brand-text {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    .brand-subtitle {
      font-size: 12px;
      opacity: 0.8;
      font-weight: 400;
    }

    .navbar-menu {
      display: flex;
      gap: 8px;
    }

    .navbar-menu a {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
    }

    .navbar-menu a.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .navbar-menu mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class NavbarComponent { }