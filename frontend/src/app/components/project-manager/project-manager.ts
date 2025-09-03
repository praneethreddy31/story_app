import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { StoryService, Project } from '../../services/story';

@Component({
  selector: 'app-project-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="project-container">
      <div class="header">
        <h1>Project Manager</h1>
        <button mat-raised-button color="primary" (click)="createProject()">
          <mat-icon>add</mat-icon>
          New Project
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="projects" class="project-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let project">{{project.title}}</td>
            </ng-container>

            <ng-container matColumnDef="genre">
              <th mat-header-cell *matHeaderCellDef>Genre</th>
              <td mat-cell *matCellDef="let project">{{project.genre || 'N/A'}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let project">{{project.status}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let project">
                <button mat-icon-button color="primary" (click)="editProject(project)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteProject(project)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div class="empty-state" *ngIf="projects.length === 0">
            <mat-icon>folder_open</mat-icon>
            <h3>No projects yet</h3>
            <p>Create your first story project to get started!</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .project-container {
      padding: 20px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .project-table {
      width: 100%;
    }
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
  `]
})
export class ProjectManagerComponent implements OnInit {
  projects: Project[] = [];
  displayedColumns: string[] = ['title', 'genre', 'status', 'actions'];

  constructor(
    private storyService: StoryService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.storyService.getProjects().subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        this.snackBar.open('Error loading projects', 'Close', { duration: 3000 });
      }
    });
  }

  createProject() {
    console.log('Creating new project');
    // TODO: Implement project creation dialog
    this.snackBar.open('Project creation coming soon!', 'Close', { duration: 3000 });
  }

  editProject(project: Project) {
    console.log('Editing project:', project);
    // TODO: Implement project editing
    this.snackBar.open('Project editing coming soon!', 'Close', { duration: 3000 });
  }

  deleteProject(project: Project) {
    console.log('Deleting project:', project);
    // TODO: Implement project deletion with confirmation
    this.snackBar.open('Project deletion coming soon!', 'Close', { duration: 3000 });
  }
}
