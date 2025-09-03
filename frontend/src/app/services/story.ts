import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Project {
  id: string;
  title: string;
  genre?: string;
  status: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  genre?: string;
  description?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private apiUrl = `${environment.backendUrl}/api`;

  constructor(private http: HttpClient) { }

  // Get all projects
  getProjects(): Observable<Project[]> {
    return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/projects`).pipe(
      map(response => response.data)
    );
  }

  // Create new project
  createProject(project: CreateProjectRequest): Observable<Project> {
    return this.http.post<ApiResponse<Project>>(`${this.apiUrl}/projects`, project).pipe(
      map(response => response.data)
    );
  }

  // Get project by ID
  getProject(id: string): Observable<Project> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/projects/${id}`).pipe(
      map(response => response.data)
    );
  }

  // Update project
  updateProject(id: string, project: Partial<CreateProjectRequest>): Observable<Project> {
    return this.http.put<ApiResponse<Project>>(`${this.apiUrl}/projects/${id}`, project).pipe(
      map(response => response.data)
    );
  }

  // Delete project
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${id}`);
  }

  // Get project sessions
  getProjectSessions(projectId: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/projects/${projectId}/sessions`).pipe(
      map(response => response.data)
    );
  }

  // Create session
  createSession(projectId: string, session: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/projects/${projectId}/sessions`, session).pipe(
      map(response => response.data)
    );
  }
}
