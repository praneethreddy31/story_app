import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConversationRequest {
  message: string;
  conversation_history?: any[];
  project_context?: any;
}

export interface ConversationResponse {
  id: string;
  content: string;
  suggestions: string[];
  metadata: any;
  moderation_result?: any;
}

export interface ContentActionRequest {
  content: string;
  action_type: string;
  feedback?: string;
}

export interface ContentActionResponse {
  id: string;
  original_content: string;
  new_content: string;
  action_type: string;
  metadata: any;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private aiUrl = `${environment.aiServiceUrl}/api/v1`;

  constructor(private http: HttpClient) { }

  // Send message to AI
  sendMessage(request: ConversationRequest): Observable<ConversationResponse> {
    return this.http.post<ConversationResponse>(`${this.aiUrl}/conversational/conversation`, request);
  }

  // Expand content
  expandContent(request: ContentActionRequest): Observable<ContentActionResponse> {
    return this.http.post<ContentActionResponse>(`${this.aiUrl}/conversational/content/expand`, request);
  }

  // Summarize content
  summarizeContent(request: ContentActionRequest): Observable<ContentActionResponse> {
    return this.http.post<ContentActionResponse>(`${this.aiUrl}/conversational/content/summarize`, request);
  }

  // Retry generation
  retryGeneration(request: ContentActionRequest): Observable<ContentActionResponse> {
    return this.http.post<ContentActionResponse>(`${this.aiUrl}/conversational/content/retry`, request);
  }

  // Generate story
  generateStory(prompt: string): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/story/generate`, { prompt });
  }

  // Generate character
  generateCharacter(description: string): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/character/generate`, { description });
  }

  // Generate plot
  generatePlot(genre: string, theme: string): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/plot/generate`, { genre, theme });
  }
}
