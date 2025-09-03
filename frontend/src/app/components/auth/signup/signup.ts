import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService, SignupRequest, AuthResponse } from '../../../services/auth';
import { NotificationService } from '../../../services/notification';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="signup-container">
      <!-- Left Section - Dynamic Background -->
      <div class="left-section">
        <div class="dynamic-background">
          <div class="screen-grid">
            <div class="screen" *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]">
              <div class="screen-content" [ngClass]="'screen-' + (i % 5)">
                <mat-icon *ngIf="i % 3 === 0">person_add</mat-icon>
                <mat-icon *ngIf="i % 3 === 1">create</mat-icon>
                <mat-icon *ngIf="i % 3 === 2">stars</mat-icon>
              </div>
            </div>
          </div>
          <div class="geometric-shapes">
            <div class="shape hexagon"></div>
            <div class="shape plus"></div>
            <div class="shape circle"></div>
            <div class="shape triangle"></div>
          </div>
        </div>
        <div class="left-content">
          <div class="brand-info">
            <mat-icon class="brand-icon">auto_stories</mat-icon>
            <h1 class="brand-title">Story Engine</h1>
            <p class="brand-subtitle">Join the creative revolution</p>
          </div>
        </div>
      </div>

      <!-- Right Section - Signup Form -->
      <div class="right-section">
        <div class="form-container">
          <div class="welcome-text">
            <h2>Join</h2>
            <div class="logo">
              <mat-icon>auto_stories</mat-icon>
              <span>Story Engine</span>
            </div>
          </div>

          <form (ngSubmit)="onSubmit()" #signupForm="ngForm" class="signup-form">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Name</mat-label>
              <input matInput 
                     [(ngModel)]="signupData.name" 
                     name="name"
                     placeholder="Enter your name"
                     required>
              <mat-icon matSuffix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email</mat-label>
              <input matInput 
                     [(ngModel)]="signupData.email" 
                     name="email"
                     type="email"
                     placeholder="Enter your email"
                     required>
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <input matInput 
                     [(ngModel)]="signupData.password" 
                     name="password"
                     [type]="showPassword ? 'text' : 'password'"
                     placeholder="Enter your password"
                     required>
              <button mat-icon-button matSuffix (click)="togglePasswordVisibility()" type="button">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Confirm Password</mat-label>
              <input matInput 
                     [(ngModel)]="confirmPassword" 
                     name="confirmPassword"
                     type="password"
                     placeholder="Confirm your password"
                     required>
              <mat-icon matSuffix>visibility</mat-icon>
            </mat-form-field>

            <button mat-raised-button 
                    type="submit" 
                    class="submit-btn"
                    [disabled]="isLoading || !signupForm.valid || signupData.password !== confirmPassword">
              <mat-icon *ngIf="!isLoading">person_add</mat-icon>
              <mat-icon *ngIf="isLoading">hourglass_empty</mat-icon>
              {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>

          <div class="form-footer">
            <p>Already have an account? 
              <a (click)="goToLogin()" class="link">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
         .signup-container {
       display: flex;
       height: 100vh;
       background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
     }

    .left-section {
      flex: 2;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

         .dynamic-background {
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
     }

    .screen-grid {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(4, 1fr);
      gap: 20px;
      padding: 40px;
      opacity: 0.6;
    }

         .screen {
       background: rgba(255, 255, 255, 0.2);
       border-radius: 8px;
       backdrop-filter: blur(10px);
       border: 1px solid rgba(255, 255, 255, 0.3);
       display: flex;
       align-items: center;
       justify-content: center;
       transition: all 0.3s ease;
       animation: float 6s ease-in-out infinite;
     }

    .screen:nth-child(odd) {
      animation-delay: 0s;
    }

    .screen:nth-child(even) {
      animation-delay: 3s;
    }

         .screen-content {
       color: #495057;
       text-align: center;
     }

    .screen-content mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

         .screen-0 { background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); }
     .screen-1 { background: linear-gradient(45deg, #e3f2fd 0%, #bbdefb 100%); }
     .screen-2 { background: linear-gradient(45deg, #f3e5f5 0%, #e1bee7 100%); }
     .screen-3 { background: linear-gradient(45deg, #e8f5e8 0%, #c8e6c9 100%); }
     .screen-4 { background: linear-gradient(45deg, #fff3e0 0%, #ffcc80 100%); }

    .geometric-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .shape {
      position: absolute;
      opacity: 0.1;
      animation: rotate 20s linear infinite;
    }

         .hexagon {
       top: 10%;
       left: 10%;
       width: 60px;
       height: 60px;
       background: linear-gradient(45deg, #e3f2fd, #bbdefb);
       clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
     }

     .plus {
       top: 70%;
       right: 15%;
       width: 40px;
       height: 40px;
       background: linear-gradient(45deg, #f3e5f5, #e1bee7);
       clip-path: polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%);
     }

     .circle {
       bottom: 20%;
       left: 20%;
       width: 50px;
       height: 50px;
       background: linear-gradient(45deg, #e8f5e8, #c8e6c9);
       border-radius: 50%;
     }

     .triangle {
       top: 50%;
       right: 30%;
       width: 45px;
       height: 45px;
       background: linear-gradient(45deg, #fff3e0, #ffcc80);
       clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
     }

         .left-content {
       position: relative;
       z-index: 2;
       text-align: center;
       color: #495057;
     }

    .brand-info {
      max-width: 400px;
    }

    .brand-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      color: #667eea;
    }

         .brand-title {
       font-size: 48px;
       font-weight: 700;
       margin: 0 0 16px 0;
       color: #1a1a2e;
       text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
       letter-spacing: 2px;
     }

         .brand-subtitle {
       font-size: 20px;
       margin: 0;
       opacity: 0.8;
       font-weight: 300;
       color: #6c757d;
     }

         .right-section {
       flex: 1;
       background: white;
       display: flex;
       align-items: center;
       justify-content: center;
       padding: 40px;
       box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
     }

    .form-container {
      width: 100%;
      max-width: 400px;
    }

         .welcome-text {
       text-align: center;
       margin-bottom: 40px;
       color: #495057;
     }

    .welcome-text h2 {
      font-size: 24px;
      font-weight: 300;
      margin: 0 0 16px 0;
      opacity: 0.8;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 32px;
      font-weight: 700;
    }

    .logo mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #667eea;
    }

    .signup-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-field {
      width: 100%;
    }

    .form-field ::ng-deep .mat-mdc-form-field {
      background: #ffffff;
      border-radius: 8px;
    }

    .form-field ::ng-deep .mat-mdc-text-field-wrapper {
      background: #ffffff;
      border-radius: 8px;
      border: 2px solid #dee2e6 !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .form-field ::ng-deep .mat-mdc-form-field-focus-overlay {
      background: transparent;
    }

    .form-field ::ng-deep .mat-mdc-form-field:focus-within .mat-mdc-text-field-wrapper {
      border-color: #667eea !important;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }

    .form-field ::ng-deep .mat-mdc-form-field-label {
      color: #495057;
    }

    .form-field ::ng-deep .mat-mdc-input-element {
      color: #000000 !important;
      font-weight: 500;
    }

    .form-field ::ng-deep input.mat-mdc-input-element {
      color: #000000 !important;
    }

    .form-field ::ng-deep textarea.mat-mdc-input-element {
      color: #000000 !important;
    }

    .form-field ::ng-deep .mat-mdc-form-field-icon-suffix {
      color: #495057;
    }

    .submit-btn {
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 16px;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: none;
    }

    .form-footer {
      text-align: center;
      margin-top: 32px;
      color: #6c757d;
    }

    .link {
      color: #667eea;
      cursor: pointer;
      text-decoration: none;
      font-weight: 600;
    }

    .link:hover {
      text-decoration: underline;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .signup-container {
        flex-direction: column;
      }
      
      .left-section {
        flex: 1;
        min-height: 40vh;
      }
      
      .right-section {
        flex: 1;
        padding: 20px;
      }
      
      .screen-grid {
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 10px;
        padding: 20px;
      }
      
      .brand-title {
        font-size: 32px;
      }
      
      .brand-subtitle {
        font-size: 16px;
      }
    }
  `]
})
export class SignupComponent {
  signupData: SignupRequest = {
    name: '',
    email: '',
    password: ''
  };
  confirmPassword = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.signupData.name || !this.signupData.email || !this.signupData.password) {
      this.notificationService.error('Validation Error', 'Please fill in all fields to begin your story');
      return;
    }

    if (this.signupData.password !== this.confirmPassword) {
      this.notificationService.error('Password Mismatch', 'Your passwords don\'t match. Please try again.');
      return;
    }

    if (this.signupData.password.length < 6) {
      this.notificationService.warning('Password Too Short', 'Your password must be at least 6 characters long for security.');
      return;
    }

    this.isLoading = true;
    this.authService.signup(this.signupData).subscribe({
      next: (response: AuthResponse) => {
        this.isLoading = false;
        this.notificationService.success('Welcome to Story Engine!', `Hello ${response.data.user.name}, your creative journey begins now!`);
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.isLoading = false;
        const message = error.error?.message || 'Account creation failed. Please try again with different details.';
        this.notificationService.error('Signup Failed', message);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
