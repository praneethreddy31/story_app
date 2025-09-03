import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StoryService, Project } from '../../services/story';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="project-detail-container">
      <div class="header-section">
        <button mat-icon-button class="back-btn" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="page-title">Project Details</h1>
      </div>

      <div class="content-section" *ngIf="project; else loading">
        <mat-card class="project-card">
          <div class="project-header">
            <div class="project-icon">
              <mat-icon>description</mat-icon>
            </div>
            <div class="project-info">
              <h2 class="project-title">{{ project.title }}</h2>
              <div class="project-meta">
                <span class="project-date">Created: {{ project.createdAt | date:'MMM dd, yyyy' }}</span>
                <span class="project-status" [ngClass]="'status-' + project.status.toLowerCase()">
                  {{ project.status }}
                </span>
              </div>
            </div>
            <div class="project-actions">
              <button mat-icon-button class="action-btn" (click)="editProject()">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button class="action-btn delete-btn" (click)="deleteProject()">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <div class="project-content">
            <div class="description-section">
              <h3>Story Description</h3>
              <div class="description-text">
                {{ project.description || 'No description available' }}
              </div>
            </div>

            <div class="actions-section">
              <button mat-raised-button class="primary-btn" (click)="openStoryTeller()">
                <mat-icon>auto_stories</mat-icon>
                Continue Story
              </button>
              <button mat-button class="secondary-btn" (click)="exportProject()">
                <mat-icon>download</mat-icon>
                Export
              </button>
            </div>
          </div>
        </mat-card>
      </div>

      <ng-template #loading>
        <div class="loading-section">
          <mat-icon class="loading-icon">hourglass_empty</mat-icon>
          <p>Loading project...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
         .project-detail-container {
       min-height: 100vh;
       background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
       padding: 40px;
       color: #495057;
     }

    .header-section {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 40px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
    }

         .back-btn {
       color: #6c757d;
       background: rgba(0, 0, 0, 0.05);
       border-radius: 50%;
       width: 48px;
       height: 48px;
     }

     .back-btn:hover {
       background: rgba(0, 0, 0, 0.1);
     }

     .page-title {
       font-size: 32px;
       font-weight: 600;
       margin: 0;
       color: #495057;
     }

    .content-section {
      max-width: 1200px;
      margin: 0 auto;
    }

         .project-card {
       background: white;
       border-radius: 16px;
       padding: 32px;
       border: 1px solid rgba(0, 0, 0, 0.1);
       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
     }

    .project-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .project-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(45deg, #667eea, #764ba2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .project-icon mat-icon {
      color: white;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .project-info {
      flex: 1;
    }

         .project-title {
       font-size: 28px;
       font-weight: 600;
       margin: 0 0 8px 0;
       color: #495057;
     }

    .project-meta {
      display: flex;
      gap: 16px;
      align-items: center;
    }

         .project-date {
       font-size: 14px;
       color: #6c757d;
     }

    .project-status {
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 16px;
      text-transform: uppercase;
    }

    .status-draft {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .status-in-progress {
      background: rgba(33, 150, 243, 0.2);
      color: #2196f3;
    }

    .status-completed {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }

    .project-actions {
      display: flex;
      gap: 8px;
    }

         .action-btn {
       color: #6c757d;
       background: rgba(0, 0, 0, 0.05);
       border-radius: 50%;
       width: 40px;
       height: 40px;
       transition: all 0.3s ease;
     }

     .action-btn:hover {
       background: rgba(0, 0, 0, 0.1);
       color: #495057;
     }

    .delete-btn:hover {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }

    .project-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

         .description-section h3 {
       font-size: 20px;
       font-weight: 600;
       margin: 0 0 16px 0;
       color: #495057;
     }

     .description-text {
       font-size: 16px;
       line-height: 1.6;
       color: #6c757d;
       background: rgba(0, 0, 0, 0.02);
       padding: 20px;
       border-radius: 12px;
       border: 1px solid rgba(0, 0, 0, 0.1);
     }

    .actions-section {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .primary-btn {
      background: linear-gradient(45deg, #667eea, #764ba2);
      color: white;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .primary-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }

         .secondary-btn {
       color: #6c757d;
       border: 1px solid rgba(0, 0, 0, 0.1);
       padding: 12px 24px;
       font-size: 16px;
       border-radius: 8px;
       display: flex;
       align-items: center;
       gap: 8px;
       transition: all 0.3s ease;
     }

     .secondary-btn:hover {
       background: rgba(0, 0, 0, 0.05);
       color: #495057;
     }

    .loading-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }

    .loading-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #667eea;
      margin-bottom: 16px;
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

         .loading-section p {
       font-size: 18px;
       color: #6c757d;
       margin: 0;
     }

    @media (max-width: 768px) {
      .project-detail-container {
        padding: 20px;
      }

      .header-section {
        margin-bottom: 30px;
      }

      .page-title {
        font-size: 24px;
      }

      .project-card {
        padding: 24px;
      }

      .project-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .project-title {
        font-size: 24px;
      }

      .project-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .actions-section {
        flex-direction: column;
        align-items: stretch;
      }

      .primary-btn,
      .secondary-btn {
        justify-content: center;
      }
    }
  `]
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  projectId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private storyService: StoryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
      this.loadProject();
    });
  }

  loadProject(): void {
    if (!this.projectId) {
      this.notificationService.error('Error', 'Project ID not found');
      this.goBack();
      return;
    }

    this.storyService.getProject(this.projectId).subscribe({
      next: (project: Project) => {
        this.project = project;
      },
      error: (error: any) => {
        console.error('Error loading project:', error);
        this.notificationService.error('Error', 'Failed to load project');
        this.goBack();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  editProject(): void {
    // Navigate to edit mode or open edit dialog
    this.notificationService.info('Info', 'Edit functionality coming soon');
  }

  deleteProject(): void {
    if (!this.project) return;

    if (confirm(`Are you sure you want to delete "${this.project.title}"?`)) {
      this.storyService.deleteProject(this.project.id).subscribe({
        next: () => {
          this.notificationService.success('Success', 'Project deleted successfully!');
          this.goBack();
        },
        error: (error: any) => {
          console.error('Error deleting project:', error);
          this.notificationService.error('Error', 'Failed to delete project');
        }
      });
    }
  }

  openStoryTeller(): void {
    this.router.navigate(['/story-teller'], { 
      queryParams: { projectId: this.projectId } 
    });
  }

  exportProject(): void {
    this.notificationService.info('Info', 'Export functionality coming soon');
  }
}
