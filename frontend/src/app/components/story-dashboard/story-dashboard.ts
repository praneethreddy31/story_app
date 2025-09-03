import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { StoryService, Project, CreateProjectRequest } from '../../services/story';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-story-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Story Creation Section -->
      <div class="story-creation-section">
        <mat-card class="story-creation-card">
          <div class="card-header">
            <div class="header-icon">
              <mat-icon>auto_stories</mat-icon>
            </div>
            <div class="header-text">
              <h2>Start with a simple idea</h2>
            </div>
          </div>
          
          <div class="story-form">
            <!-- Large Story Idea Input -->
            <div class="idea-input-section">
              <mat-form-field appearance="outline" class="large-idea-input">
                <mat-label>Your Story Idea</mat-label>
                <textarea matInput 
                         [(ngModel)]="storyIdea" 
                         placeholder="Describe your story idea here..."
                         rows="4"
                         (input)="onIdeaInput()">
                </textarea>
              </mat-form-field>
            </div>

            <!-- Project Details Row -->
            <div class="project-details-row">
              <mat-form-field appearance="outline" class="detail-field">
                <mat-label>Project Title</mat-label>
                <input matInput 
                       [(ngModel)]="projectName" 
                       placeholder="Project Title">
              </mat-form-field>

              <button mat-raised-button 
                      class="generate-btn"
                      [disabled]="!canGenerateStory()"
                      (click)="generateStory()">
                <mat-icon>auto_stories</mat-icon>
                Generate Story
              </button>
            </div>
          </div>
        </mat-card>
      </div>

      <!-- All Projects Section -->
      <div class="projects-section">
        <div class="section-header">
          <h2>All Projects</h2>
          <div class="search-container">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search projects by title</mat-label>
              <input matInput 
                     [(ngModel)]="searchQuery" 
                     placeholder="Type to search..."
                     (input)="onSearchInput()">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
        </div>
        
        <div class="projects-grid" *ngIf="filteredProjects.length > 0; else noProjects">
          <mat-card class="project-card" 
                    *ngFor="let project of filteredProjects" 
                    (click)="openProject(project)">
            <div class="project-header">
              <mat-icon class="project-icon">description</mat-icon>
              <div class="project-menu">
                <button mat-icon-button 
                        class="menu-btn"
                        (click)="$event.stopPropagation(); openEditDialog(project)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button 
                        class="menu-btn"
                        (click)="$event.stopPropagation(); deleteProject(project)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
            <div class="project-content">
              <h3 class="project-title">{{ project.title }}</h3>
              <p class="project-description">{{ project.description || 'No description available' }}</p>
              <div class="project-meta">
                <span class="project-date">{{ project.createdAt | date:'MMM dd, yyyy' }}</span>
                <span class="project-status" [ngClass]="'status-' + project.status.toLowerCase()">
                  {{ project.status }}
                </span>
              </div>
            </div>
          </mat-card>
        </div>

        <ng-template #noProjects>
          <div class="empty-state">
            <mat-icon class="empty-icon">folder_open</mat-icon>
            <h3>No projects yet</h3>
            <p>Start your first story project to see it here</p>
          </div>
        </ng-template>
      </div>

      <!-- Edit Project Dialog -->
      <div class="edit-dialog-overlay" *ngIf="showEditDialog" (click)="closeEditDialog()">
        <div class="edit-dialog" (click)="$event.stopPropagation()">
          <div class="dialog-header">
            <h2>Edit Project</h2>
            <button mat-icon-button (click)="closeEditDialog()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <div class="dialog-content">
                         <mat-form-field appearance="outline" class="edit-field">
               <mat-label>Project Title</mat-label>
               <input matInput 
                      [(ngModel)]="editingProject!.title" 
                      placeholder="Project Title">
               <mat-icon matSuffix>title</mat-icon>
             </mat-form-field>

             <mat-form-field appearance="outline" class="edit-field">
               <mat-label>Story Description</mat-label>
               <textarea matInput 
                        [(ngModel)]="editingProject!.description" 
                        placeholder="Describe your story..."
                        rows="4">
               </textarea>
               <mat-icon matSuffix>description</mat-icon>
             </mat-form-field>
          </div>
          
          <div class="dialog-actions">
            <button mat-button 
                    class="cancel-btn"
                    (click)="closeEditDialog()">
              Cancel
            </button>
            <button mat-raised-button 
                    class="save-btn"
                    [disabled]="!canSaveEdit()"
                    (click)="saveProject()">
              <mat-icon>save</mat-icon>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%);
      padding: 40px 60px;
      color: #495057;
      display: flex;
      flex-direction: column;
      gap: 60px;
      font-family: 'Roboto', sans-serif;
    }

    .story-creation-section {
      display: flex;
      justify-content: center;
    }

         .story-creation-card {
       background: white;
       border-radius: 16px;
       padding: 32px;
       max-width: 1000px;
       width: 100%;
       border: 1px solid rgba(0, 0, 0, 0.1);
       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
     }

    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }

         .header-icon {
       width: 48px;
       height: 48px;
       background: linear-gradient(45deg, #4facfe, #00f2fe);
       border-radius: 12px;
       display: flex;
       align-items: center;
       justify-content: center;
     }

    .header-icon mat-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .header-text {
      flex: 1;
    }

    .header-text h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: #495057;
      font-family: 'Roboto', sans-serif;
      letter-spacing: -0.025em;
    }

     .header-action {
       opacity: 0.6;
     }

     .header-action mat-icon {
       color: #6c757d;
     }

    .story-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .idea-input-section {
      width: 100%;
    }

    .large-idea-input {
      width: 100%;
    }

         .large-idea-input ::ng-deep .mat-mdc-form-field {
       background: #f8f9fa;
       border-radius: 12px;
     }

           .large-idea-input ::ng-deep .mat-mdc-text-field-wrapper {
        background: #ffffff;
        border-radius: 12px;
        padding: 16px;
        border: 2px solid #dee2e6;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

    .large-idea-input ::ng-deep .mat-mdc-form-field-label {
      color: #6c757d;
      font-size: 16px;
      font-family: 'Roboto', sans-serif;
    }

    .large-idea-input ::ng-deep .mat-mdc-input-element {
      color: #000000 !important;
      font-weight: 500;
      font-size: 18px;
      line-height: 1.6;
      font-family: 'Roboto', sans-serif;
    }

         .large-idea-input ::ng-deep .mat-mdc-form-field-icon-suffix {
       color: #4facfe;
     }

    .large-idea-input ::ng-deep textarea {
      min-height: 120px;
      resize: vertical;
    }

    .project-details-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .detail-field {
      flex: 1;
    }

    .detail-field ::ng-deep .mat-mdc-form-field {
      background: #f8f9fa;
      border-radius: 8px;
    }

    .detail-field ::ng-deep .mat-mdc-text-field-wrapper {
      background: #ffffff;
      border-radius: 8px;
      border: 2px solid #dee2e6;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .detail-field ::ng-deep .mat-mdc-form-field-label {
      color: #6c757d;
      font-family: 'Roboto', sans-serif;
    }

    .detail-field ::ng-deep .mat-mdc-input-element {
      color: #000000 !important;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
    }

    .detail-field ::ng-deep .mat-mdc-form-field-icon-suffix {
      color: #6c757d;
    }

    .generate-btn {
      background: linear-gradient(45deg, #4facfe, #00f2fe);
      color: white;
      padding: 16px 24px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 160px;
      height: 56px;
      box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
      font-family: 'Roboto', sans-serif;
      margin-top: 8px;
    }

     .generate-btn:hover:not(:disabled) {
       transform: translateY(-2px);
       box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
     }

    .generate-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .projects-section {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

        .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding: 0 20px;
    }

    .section-header h2 {
      font-size: 32px;
      font-weight: 600;
      margin: 0;
      color: #495057;
      font-family: 'Roboto', sans-serif;
      letter-spacing: -0.025em;
    }

    .search-container {
      display: flex;
      align-items: center;
    }

    .search-field {
      width: 300px;
    }

    .search-field ::ng-deep .mat-mdc-text-field-wrapper {
      background: white;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }

    .search-field ::ng-deep .mat-mdc-input-element {
      color: #495057;
      font-weight: 500;
      font-family: 'Roboto', sans-serif;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      padding: 0 20px;
    }

         .project-card {
       background: white;
       border-radius: 12px;
       padding: 24px;
       border: 1px solid rgba(0, 0, 0, 0.1);
       cursor: pointer;
       transition: all 0.3s ease;
       position: relative;
       overflow: hidden;
     }

     .project-card:hover {
       transform: translateY(-4px);
       box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
       border-color: rgba(102, 126, 234, 0.3);
     }

         .project-card::before {
       content: '';
       position: absolute;
       top: 0;
       left: 0;
       right: 0;
       height: 3px;
       background: linear-gradient(45deg, #4facfe, #00f2fe);
     }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

         .project-icon {
       color: #4facfe;
       font-size: 24px;
       width: 24px;
       height: 24px;
     }

    .project-menu {
      display: flex;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .project-card:hover .project-menu {
      opacity: 1;
    }

    .menu-btn {
      color: #b0b0c0;
      transition: color 0.3s ease;
    }

         .menu-btn:hover {
       color: #4facfe;
     }

    .project-content {
      flex: 1;
    }

         .project-title {
       font-size: 18px;
       font-weight: 600;
       margin: 0 0 12px 0;
       color: #495057;
       font-family: 'Roboto', sans-serif;
       letter-spacing: -0.025em;
     }

     .project-description {
       font-size: 14px;
       color: #6c757d;
       margin: 0 0 16px 0;
       line-height: 1.5;
       display: -webkit-box;
       -webkit-line-clamp: 2;
       -webkit-box-orient: vertical;
       overflow: hidden;
       font-family: 'Roboto', sans-serif;
     }

    .project-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

         .project-date {
       font-size: 12px;
       color: #6c757d;
     }

    .project-status {
      font-size: 12px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 12px;
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

         .empty-state {
       text-align: center;
       padding: 80px 20px;
       background: white;
       border-radius: 16px;
       border: 2px dashed rgba(0, 0, 0, 0.2);
       margin: 0 20px;
     }

     .empty-icon {
       font-size: 64px;
       width: 64px;
       height: 64px;
       color: #4facfe;
       margin-bottom: 24px;
     }

     .empty-state h3 {
       font-size: 24px;
       font-weight: 600;
       margin: 0 0 12px 0;
       color: #495057;
     }

     .empty-state p {
       font-size: 16px;
       color: #6c757d;
       margin: 0;
     }

    /* Edit Dialog Styles */
    .edit-dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

         .edit-dialog {
       background: white;
       border-radius: 16px;
       padding: 32px;
       max-width: 500px;
       width: 100%;
       border: 1px solid rgba(0, 0, 0, 0.1);
       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
     }

     .dialog-header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 24px;
     }

     .dialog-header h2 {
       font-size: 24px;
       font-weight: 600;
       margin: 0;
       color: #495057;
     }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }

    .edit-field {
      width: 100%;
    }

         .edit-field ::ng-deep .mat-mdc-form-field {
       background: #f8f9fa;
       border-radius: 8px;
     }

     .edit-field ::ng-deep .mat-mdc-text-field-wrapper {
       background: #f8f9fa;
       border-radius: 8px;
     }

     .edit-field ::ng-deep .mat-mdc-form-field-label {
       color: #6c757d;
     }

     .edit-field ::ng-deep .mat-mdc-input-element {
       color: #495057;
     }

     .edit-field ::ng-deep .mat-mdc-form-field-icon-suffix {
       color: #6c757d;
     }

    .dialog-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
    }

         .cancel-btn {
       color: #6c757d;
       border: 1px solid rgba(0, 0, 0, 0.1);
     }

     .cancel-btn:hover {
       background: rgba(0, 0, 0, 0.05);
     }

         .save-btn {
       background: linear-gradient(45deg, #4facfe, #00f2fe);
       color: white;
       display: flex;
       align-items: center;
       gap: 8px;
     }

     .save-btn:hover:not(:disabled) {
       transform: translateY(-2px);
       box-shadow: 0 8px 25px rgba(79, 172, 254, 0.4);
     }

    .save-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 20px;
        gap: 40px;
      }

      .story-creation-card {
        padding: 24px;
      }

      .project-details-row {
        flex-direction: column;
      }

      .detail-field {
        min-width: 100%;
      }

      .generate-btn {
        min-width: 100%;
        justify-content: center;
      }

      .projects-grid {
        grid-template-columns: 1fr;
        padding: 0;
      }

      .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
        padding: 0;
      }

      .section-header h2 {
        font-size: 24px;
      }

      .empty-state {
        margin: 0;
      }

      .edit-dialog {
        margin: 20px;
        padding: 24px;
      }

      .dialog-actions {
        flex-direction: column;
      }
    }
  `]
})
export class StoryDashboardComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchQuery = '';
  storyIdea = '';
  projectName = '';
  showProjectFields = false;
  showEditDialog = false;
  editingProject: Project | null = null;

  constructor(
    private storyService: StoryService,
    private router: Router,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    console.log('Loading projects...');
    this.storyService.getProjects().subscribe({
      next: (projects: Project[]) => {
        console.log('Loaded projects:', projects);
        console.log('Projects count:', projects.length);
        this.projects = projects;
        this.filterProjects(); // Apply search filter after loading
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        this.notificationService.error('Error', 'Failed to load projects');
      }
    });
  }

  onSearchInput(): void {
    this.filterProjects();
  }

  filterProjects(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProjects = [...this.projects];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredProjects = this.projects.filter(project => 
        project.title.toLowerCase().includes(query)
      );
    }
  }

  onIdeaInput(): void {
    // Auto-show project fields when user starts typing
    if (this.storyIdea.trim() && !this.showProjectFields) {
      this.showProjectFields = true;
    }
  }

  canGenerateStory(): boolean {
    return this.projectName.trim() !== '' && this.storyIdea.trim() !== '';
  }

     generateStory(): void {
     if (!this.canGenerateStory()) {
       this.notificationService.warning('Validation Error', 'Please fill in all required fields');
       return;
     }

     const projectData: CreateProjectRequest = {
       title: this.projectName,
       description: this.storyIdea
     };

     this.storyService.createProject(projectData).subscribe({
       next: (project: Project) => {
         this.notificationService.success('Success', 'Story project created successfully!');
         this.resetForm();
         this.loadProjects(); // Refresh the projects list
         // Navigate to Story Teller page with the new project
         this.router.navigate(['/story-teller'], { 
           queryParams: { 
             projectId: project.id,
             projectTitle: project.title,
             storyIdea: project.description
           }
         });
       },
       error: (error: any) => {
         console.error('Error creating project:', error);
         this.notificationService.error('Error', 'Failed to create story project');
       }
     });
   }

  resetForm(): void {
    this.storyIdea = '';
    this.projectName = '';
    this.showProjectFields = false;
    this.searchQuery = '';
    this.filterProjects();
  }

  openProject(project: Project): void {
    // Navigate to Story Teller with project data
    this.router.navigate(['/story-teller'], { 
      queryParams: { 
        projectId: project.id,
        projectTitle: project.title,
        storyIdea: project.description
      }
    });
  }

  openEditDialog(project: Project): void {
    this.editingProject = { ...project }; // Create a copy for editing
    this.showEditDialog = true;
  }

  closeEditDialog(): void {
    this.showEditDialog = false;
    this.editingProject = null;
  }

  canSaveEdit(): boolean {
    return this.editingProject !== null && 
           this.editingProject.title?.trim() !== '' && 
           this.editingProject.description?.trim() !== '';
  }

  saveProject(): void {
    if (!this.editingProject || !this.canSaveEdit()) {
      return;
    }

    const updateData = {
      title: this.editingProject.title,
      description: this.editingProject.description
    };

    this.storyService.updateProject(this.editingProject.id, updateData).subscribe({
      next: (updatedProject: Project) => {
        this.notificationService.success('Success', 'Project updated successfully!');
        this.closeEditDialog();
        this.loadProjects(); // Refresh the projects list
      },
      error: (error: any) => {
        console.error('Error updating project:', error);
        this.notificationService.error('Error', 'Failed to update project');
      }
    });
  }

  deleteProject(project: Project): void {
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      this.storyService.deleteProject(project.id).subscribe({
        next: () => {
          this.notificationService.success('Success', 'Project deleted successfully!');
          this.loadProjects(); // Refresh the projects list
        },
        error: (error: any) => {
          console.error('Error deleting project:', error);
          this.notificationService.error('Error', 'Failed to delete project');
        }
      });
    }
  }
}
