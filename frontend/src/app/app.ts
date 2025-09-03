import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, User } from './services/auth';
import { Router } from '@angular/router';
import { NotificationComponent } from './components/shared/notification/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    NotificationComponent
  ],
  template: `
    <div class="app-container">
      <!-- Auth pages (login/signup) -->
      <div *ngIf="!isAuthenticated" class="auth-container">
        <router-outlet></router-outlet>
      </div>

      <!-- Main app with navigation -->
      <div *ngIf="isAuthenticated" class="main-container">
        <mat-toolbar class="toolbar">
          <div class="toolbar-left">
            <mat-icon class="logo-icon">auto_stories</mat-icon>
            <span class="app-title">Story Engine</span>
          </div>
          <div class="toolbar-right">
            <span class="user-name" *ngIf="currentUser">{{ currentUser.name }}</span>
            <button mat-icon-button (click)="logout()" matTooltip="Logout">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </mat-toolbar>

        <div class="main-content">
          <mat-sidenav-container class="sidenav-container">
            <mat-sidenav 
              #drawer 
              class="sidenav" 
              [attr.role]="'navigation'"
              [mode]="'side'" 
              [opened]="true">
              
              <mat-nav-list class="nav-list">
                <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
                  <mat-icon matListItemIcon>dashboard</mat-icon>
                  <span matListItemTitle>Dashboard</span>
                </a>
              </mat-nav-list>
            </mat-sidenav>

            <mat-sidenav-content class="sidenav-content">
              <router-outlet></router-outlet>
            </mat-sidenav-content>
          </mat-sidenav-container>
        </div>
      </div>
    </div>

    <!-- Global notifications -->
    <app-notification></app-notification>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }

    .auth-container {
      height: 100vh;
      font-family: 'Roboto', sans-serif;
    }

    .main-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      background: #ffffff;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      height: 64px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      color: #4facfe;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .app-title {
      font-size: 24px;
      font-weight: 600;
      color: #495057;
      font-family: 'Roboto', sans-serif;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-name {
      color: #495057;
      font-size: 14px;
    }

    .main-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .sidenav-container {
      width: 100%;
      height: 100%;
    }

    .sidenav {
      width: 250px;
      background: #ffffff;
      border-right: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    }

    .nav-list {
      padding: 16px 0;
    }

    .nav-list a {
      color: #495057;
      margin: 4px 16px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .nav-list a:hover {
      background: rgba(79, 172, 254, 0.1);
      color: #4facfe;
    }

    .nav-list a.active {
      background: rgba(79, 172, 254, 0.2);
      color: #4facfe;
    }

    .nav-list mat-icon {
      color: inherit;
    }

    .sidenav-content {
      background: transparent;
      overflow-y: auto;
    }

         /* Global styles for all pages */
     ::ng-deep body {
       margin: 0;
       padding: 0;
       font-family: 'Roboto', sans-serif;
       background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
       color: #495057;
       min-height: 100vh;
       overflow-x: hidden;
     }

    ::ng-deep * {
      box-sizing: border-box;
    }

         /* Material Design overrides for light theme */
     ::ng-deep .mat-mdc-card {
       background: white !important;
       color: #495057 !important;
       border: 1px solid rgba(0, 0, 0, 0.1) !important;
     }

     ::ng-deep .mat-mdc-form-field {
       color: #495057 !important;
     }

     ::ng-deep .mat-mdc-input-element {
       color: #000000 !important;
       font-weight: 500;
     }

     ::ng-deep .mat-mdc-form-field-label {
       color: #6c757d !important;
     }

     ::ng-deep .mat-mdc-button {
       color: #4facfe !important;
     }

     ::ng-deep .mat-mdc-raised-button {
       background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%) !important;
       color: white !important;
     }

    /* Ensure full screen coverage */
    ::ng-deep html, ::ng-deep body {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
    }

    /* Clear section partitions */
    ::ng-deep .section-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
      margin: 40px 0;
    }

         /* Page containers */
     ::ng-deep .page-container {
       min-height: calc(100vh - 64px);
       padding: 40px 60px;
       background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
     }

    @media (max-width: 768px) {
      .sidenav {
        width: 200px;
      }

      .toolbar {
        padding: 0 16px;
      }

      .app-title {
        font-size: 20px;
      }
    }
  `]
})
export class AppComponent {
  isAuthenticated = false;
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Force clear any existing authentication state on startup
    this.authService.forceClearAuth();
    
    // Set initial authentication state
    this.isAuthenticated = false;
    
    // Subscribe to authentication changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
      
      // If user is not authenticated and not on login/signup page, redirect
      if (!this.isAuthenticated && !this.isOnAuthPage()) {
        this.router.navigate(['/login']);
      }
    });
  }

  private isOnAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/login' || currentUrl === '/signup';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
