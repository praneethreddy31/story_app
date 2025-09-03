import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { StoryService, CreateProjectRequest } from '../../services/story';
import { NotificationService } from '../../services/notification';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

@Component({
  selector: 'app-story-teller',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="story-teller-container">
      <!-- Header with Project Info on Right -->
      <div class="chat-header">
        <div class="header-content">
          <div class="header-left">
            <mat-icon class="header-icon">auto_stories</mat-icon>
            <span class="header-title">Story Teller</span>
          </div>
          <div class="header-right">
            <div class="project-info">
              <h2 class="header-project-title">{{ projectName || 'Story Teller' }}</h2>
              <p class="header-project-description">{{ storyIdea || 'Transform your ideas into captivating stories' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Interface -->
      <div class="chat-interface" *ngIf="projectCreated">
        <div class="messages-container">
          <div *ngFor="let message of messages" class="message" [ngClass]="message.sender + '-message'">
            <div class="message-avatar">
              <mat-icon *ngIf="message.sender === 'ai'">smart_toy</mat-icon>
              <mat-icon *ngIf="message.sender === 'user'">person</mat-icon>
            </div>
            <div class="message-content">
              <div class="message-text" [innerHTML]="formatMessage(message.content)"></div>
              <div class="message-actions">
                <div class="message-time">{{ message.timestamp | date:'shortTime' }}</div>
                <button mat-icon-button 
                        *ngIf="message.sender === 'ai'"
                        (click)="speakMessage(message.content)"
                        [disabled]="isSpeaking"
                        class="speak-btn">
                  <mat-icon>{{ isSpeaking ? 'volume_off' : 'volume_up' }}</mat-icon>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Loading indicator -->
          <div *ngIf="isSendingMessage" class="message ai-message">
            <div class="message-avatar">
              <mat-icon>smart_toy</mat-icon>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <!-- Scroll to bottom button -->
          <button class="scroll-to-bottom" 
                  [class.hidden]="isAtBottom"
                  (click)="scrollToBottom()"
                  *ngIf="messages.length > 0">
            <mat-icon>keyboard_arrow_down</mat-icon>
          </button>
        </div>
        
        <!-- Input Area -->
        <div class="input-area">
          <div class="input-container">
            <mat-form-field appearance="outline" class="message-input">
              <textarea matInput 
                       [(ngModel)]="userInput" 
                       placeholder="Ask about your story..."
                       (keydown.enter)="sendMessage($event)"
                       [disabled]="isSendingMessage"
                       rows="1"
                       #messageTextarea>
              </textarea>
              <button mat-icon-button matSuffix 
                      (click)="toggleSpeechRecognition()"
                      [disabled]="isSendingMessage"
                      class="mic-button"
                      [class.listening]="isListening">
                <mat-icon>{{ isListening ? 'mic' : 'mic_none' }}</mat-icon>
              </button>
              <button mat-icon-button matSuffix 
                      (click)="sendMessage()" 
                      [disabled]="!userInput.trim() || isSendingMessage"
                      class="send-button">
                <mat-icon>send</mat-icon>
              </button>
            </mat-form-field>
          </div>
        </div>
      </div>

      <!-- Project Creation Form -->
      <div *ngIf="!projectCreated" class="project-form">
        <div class="form-card">
          <h3>Start Your Story Journey</h3>
          <p class="form-description">Tell us about your story idea and we'll help you bring it to life!</p>
          
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Project Name</mat-label>
            <input matInput [(ngModel)]="projectName" placeholder="Enter your project name..." required>
            <mat-icon matSuffix>edit</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Genre</mat-label>
            <input matInput [(ngModel)]="genre" placeholder="Fantasy, Sci-Fi, Mystery, Romance..." required>
            <mat-icon matSuffix>category</mat-icon>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Your Story Idea</mat-label>
            <textarea matInput [(ngModel)]="storyIdea" 
                      placeholder="Describe your story idea, characters, plot, or any inspiration you have..."
                      rows="4" required></textarea>
            <mat-icon matSuffix>lightbulb</mat-icon>
          </mat-form-field>
          
          <div class="form-actions">
            <button mat-raised-button color="primary" 
                    (click)="generateStory()" 
                    [disabled]="!canCreateProject() || isLoading"
                    class="create-btn">
              <mat-icon *ngIf="!isLoading">auto_stories</mat-icon>
              <mat-icon *ngIf="isLoading">hourglass_empty</mat-icon>
              {{ isLoading ? 'Generating Story...' : 'Generate Story' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .story-teller-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      overflow: hidden;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      font-family: 'Roboto', sans-serif;
      z-index: 1;
    }

    .chat-header {
      background: #ffffff;
      border-bottom: 1px solid #e5e5e5;
      padding: 16px 24px;
      position: relative;
      z-index: 1000;
      flex-shrink: 0;
      height: 80px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      height: 100%;
      width: 100%;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      color: #4facfe;
      font-size: 32px;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    .header-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      font-family: 'Roboto', sans-serif;
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    .project-info {
      text-align: right;
      max-width: 400px;
    }

    .header-project-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: #1a1a1a;
      font-family: 'Roboto', sans-serif;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .header-project-description {
      font-size: 14px;
      color: #666;
      margin: 0;
      font-family: 'Roboto', sans-serif;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chat-interface {
      flex: 1;
      display: flex;
      flex-direction: column;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      min-height: 0;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      min-height: 0;
      position: relative;
      scroll-behavior: smooth;
    }

    /* Scroll to bottom button */
    .scroll-to-bottom {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #4facfe;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      z-index: 10;
    }

    .scroll-to-bottom:hover {
      background: #3a8bfd;
      transform: scale(1.1);
    }

    .scroll-to-bottom.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .message {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      animation: fadeIn 0.3s ease-in;
    }

    .user-message {
      flex-direction: row-reverse;
    }

    .ai-message {
      flex-direction: row;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-message .message-avatar {
      background: #4facfe;
    }

    .ai-message .message-avatar {
      background: #10a37f;
    }

    .message-avatar mat-icon {
      color: white;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .message-content {
      flex: 1;
      max-width: 70%;
    }

    .user-message .message-content {
      text-align: right;
    }

    .ai-message .message-content {
      text-align: left;
    }

    .message-text {
      font-size: 16px;
      line-height: 1.6;
      color: #1a1a1a;
      margin-bottom: 8px;
      padding: 12px 16px;
      border-radius: 12px;
      display: inline-block;
      font-family: 'Roboto', sans-serif;
    }

    .user-message .message-text {
      background: #4facfe;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .ai-message .message-text {
      background: #f0f0f0;
      color: #1a1a1a;
      border-bottom-left-radius: 4px;
    }

    .message-text p {
      margin: 0 0 12px 0;
    }

    .message-text p:last-child {
      margin-bottom: 0;
    }

    .message-time {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }

    .user-message .message-time {
      text-align: right;
    }

    .ai-message .message-time {
      text-align: left;
    }

    .message-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .user-message .message-actions {
      justify-content: flex-end;
    }

    .ai-message .message-actions {
      justify-content: flex-start;
    }

    .speak-btn {
      color: #4facfe;
      font-size: 16px;
      width: 24px;
      height: 24px;
      margin-left: 8px;
    }

    .speak-btn:disabled {
      color: #ccc;
    }

    .mic-button {
      color: #4facfe;
      transition: all 0.3s ease;
    }

    .mic-button.listening {
      color: #ff4444;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }

    .input-area {
      border-top: 1px solid #e5e5e5;
      background: #ffffff;
      padding: 24px;
      flex-shrink: 0;
    }

    .input-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .message-input {
      width: 100%;
    }

    .message-input ::ng-deep .mat-mdc-text-field-wrapper {
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      padding: 8px 16px;
    }

    .message-input ::ng-deep .mat-mdc-form-field-focus-overlay {
      display: none;
    }

    .message-input ::ng-deep .mat-mdc-input-element {
      font-size: 16px;
      line-height: 1.5;
      color: #1a1a1a;
      font-family: 'Roboto', sans-serif;
    }

    .send-button {
      color: #4facfe;
    }

    .send-button:disabled {
      color: #ccc;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 8px 0;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10a37f;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) {
      animation-delay: -0.32s;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes typing {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .project-form {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .form-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 100%;
    }

    .form-card h3 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #1a1a1a;
    }

    .form-description {
      font-size: 14px;
      color: #666;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      margin-top: 24px;
    }

    .create-btn {
      width: 100%;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .chat-header {
        padding: 12px 16px;
      }

      .header-text h1 {
        font-size: 20px;
      }

      .messages-container {
        padding: 16px;
      }

      .input-area {
        padding: 16px;
      }

      .form-card {
        margin: 16px;
        padding: 24px;
      }
    }
  `]
})
export class StoryTellerComponent implements OnInit {
  projectName: string = 'Story Teller';
  genre: string = '';
  storyIdea: string = 'Transform your ideas into captivating stories';
  isLoading: boolean = false;
  projectCreated: boolean = false;
  currentProjectId: string = '';
  messages: ChatMessage[] = [];
  userInput: string = '';
  isSendingMessage: boolean = false;
  
  // Speech functionality
  isListening: boolean = false;
  isSpeaking: boolean = false;
  speechRecognition: any;
  speechSynthesis!: SpeechSynthesis;
  currentUtterance: SpeechSynthesisUtterance | null = null;
  isAtBottom: boolean = true;

  constructor(
    private storyService: StoryService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Initialize speech synthesis
    this.speechSynthesis = window.speechSynthesis;
    
    // Add scroll event listener
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.addEventListener('scroll', () => {
          this.checkScrollPosition();
        });
      }
    }, 1000);
    
    // Check if we have query parameters from dashboard
    this.route.queryParams.subscribe(params => {
      console.log('Query params received:', params);
      if (params['projectId'] && params['projectTitle'] && params['storyIdea']) {
        this.currentProjectId = params['projectId'];
        this.projectName = params['projectTitle'];
        this.storyIdea = params['storyIdea'];
        this.genre = 'General'; // Default genre
        this.projectCreated = true;
        
        console.log('Project data set:', {
          projectName: this.projectName,
          storyIdea: this.storyIdea,
          projectCreated: this.projectCreated
        });
        
        // Debug: Check if project name is set correctly
        setTimeout(() => {
          console.log('Current projectName after setting:', this.projectName);
          console.log('Current storyIdea after setting:', this.storyIdea);
        }, 100);
        
        // Load existing conversation - this will handle whether to generate initial response
        this.loadConversation();
      } else {
        console.log('No project params found, showing creation form');
      }
    });
  }

  private generateInitialResponse(): void {
    this.isSendingMessage = true;
    
    this.callAIService(`I have a story idea: "${this.storyIdea}". Can you help me develop this story? Please give me some initial thoughts and suggestions to get started.`).then(aiResponse => {
      const aiMessage: ChatMessage = {
        id: '1',
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      this.messages.push(aiMessage);
      this.isSendingMessage = false;
      
      // Save conversation to backend
      this.saveConversation();
    }).catch(error => {
      console.error('AI Service Error:', error);
      const errorMessage: ChatMessage = {
        id: '1',
        content: `Welcome to your story project "${this.projectName}"! I'm here to help you develop your story. What would you like to work on first?`,
        sender: 'ai',
        timestamp: new Date()
      };
      this.messages.push(errorMessage);
      this.isSendingMessage = false;
      this.notificationService.error('Error', 'Failed to get AI response');
    });
  }

  private loadConversation(): void {
    if (this.currentProjectId) {
      console.log('Loading conversation for project:', this.currentProjectId);
      this.http.get(`${environment.backendUrl}/api/conversations/${this.currentProjectId}`).subscribe({
        next: (response: any) => {
          console.log('Conversation response:', response);
          if (response.data && response.data.messages && response.data.messages.length > 0) {
            this.messages = response.data.messages.map((msg: any) => ({
              id: msg.id || Date.now().toString(),
              content: msg.content,
              sender: msg.sender,
              timestamp: new Date(msg.timestamp)
            }));
            console.log('Loaded messages:', this.messages);
          } else {
            console.log('No existing messages found, will generate initial response');
            // Only generate initial response if no conversation exists
            this.generateInitialResponse();
          }
        },
        error: (error) => {
          console.error('Error loading conversation:', error);
          // Only generate initial response if no conversation exists
          if (this.messages.length === 0) {
            this.generateInitialResponse();
          }
        }
      });
    } else {
      console.log('No project ID, will generate initial response');
      this.generateInitialResponse();
    }
  }

  public formatMessage(content: string): string {
    // Clean and format the message with proper HTML
    return content
      // Remove any existing HTML tags that might cause issues
      .replace(/<[^>]*>/g, '')
      // Convert markdown-style formatting
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      // Convert line breaks
      .replace(/\n\n/g, '</p><p>') // Double line breaks become new paragraphs
      .replace(/\n/g, '<br>') // Single line breaks become <br>
      // Wrap in paragraphs
      .replace(/^/, '<p>') // Start with <p>
      .replace(/$/, '</p>') // End with </p>
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
      .replace(/<p><br><\/p>/g, '');
  }

  canCreateProject(): boolean {
    return this.projectName.trim().length > 0 && 
           this.genre.trim().length > 0 && 
           this.storyIdea.trim().length > 10;
  }

  generateStory(): void {
    if (!this.canCreateProject()) {
      this.notificationService.error('Validation Error', 'Please fill in all fields with meaningful content');
      return;
    }

    this.isLoading = true;
    const projectData: CreateProjectRequest = {
      title: this.projectName,
      genre: this.genre,
      description: this.storyIdea
    };

    this.storyService.createProject(projectData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.projectCreated = true;
        this.currentProjectId = response.id;
        this.notificationService.success(
          'Project Created!', 
          `"${this.projectName}" is ready for story development!`
        );
        
        // Generate initial AI response for new projects only
        this.generateInitialResponse();
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.error || 'Failed to create project. Please try again.';
        this.notificationService.error('Project Creation Failed', message);
      }
    });
  }

  sendMessage(event?: Event): void {
    if (event && (event as KeyboardEvent).shiftKey) {
      return; // Allow new line on Shift+Enter
    }
    if (event) {
      event.preventDefault();
    }
    
    if (this.userInput.trim() && !this.isSendingMessage) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: this.userInput,
        sender: 'user',
        timestamp: new Date()
      };
      
      this.messages.push(userMessage);
      const currentInput = this.userInput;
      this.userInput = '';
      this.isSendingMessage = true;

             // Call the AI service
       this.callAIService(currentInput).then(aiResponse => {
         const aiMessage: ChatMessage = {
           id: (Date.now() + 1).toString(),
           content: aiResponse,
           sender: 'ai',
           timestamp: new Date()
         };
         this.messages.push(aiMessage);
         this.isSendingMessage = false;
         
         // Save conversation to backend
         this.saveConversation();
         
         // Scroll to bottom after adding message
         setTimeout(() => {
           this.scrollToBottom();
         }, 100);
       }).catch(error => {
        console.error('AI Service Error:', error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'I apologize, but I encountered an error. Please try again.',
          sender: 'ai',
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.isSendingMessage = false;
        this.notificationService.error('Error', 'Failed to get AI response');
      });
    }
  }

  private async callAIService(userInput: string): Promise<string> {
    try {
      console.log('Calling AI service with prompt:', userInput);
      console.log('AI Service URL:', `${environment.aiServiceUrl}/api/v1/conversational/conversation`);
      
      // Create a detailed context for the AI
      const projectContext = {
        project_name: this.projectName,
        genre: this.genre,
        story_idea: this.storyIdea,
        current_project_id: this.currentProjectId,
        total_messages: this.messages.length
      };

      // Prepare conversation history with proper formatting
      const conversationHistory = this.messages.map(msg => ({
        sender: msg.sender === 'user' ? 'USER' : 'ASSISTANT',
        content: msg.content,
        timestamp: msg.timestamp
      }));

      const requestBody = {
        message: userInput,
        conversation_history: conversationHistory,
        project_context: projectContext
      };

      console.log('Sending request to AI service:', requestBody);
      
      const response = await this.http.post(`${environment.backendUrl}/api/ai/generate`, requestBody).toPromise();

      console.log('AI Service Response:', response);
      
      if ((response as any).content) {
        return (response as any).content;
      } else {
        console.error('Unexpected AI response format:', response);
        return 'I apologize, but I couldn\'t generate a response at the moment. Please try again.';
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      console.error('Error details:', error);
      throw error;
    }
  }

  private saveConversation(): void {
    if (this.currentProjectId) {
      const conversationData = {
        projectId: this.currentProjectId,
        messages: this.messages.map(msg => ({
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp
        }))
      };

      this.http.post(`${environment.backendUrl}/api/conversations`, conversationData).subscribe({
        next: () => {
          console.log('Conversation saved successfully');
        },
        error: (error) => {
          console.error('Error saving conversation:', error);
        }
      });
    }
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
  }

  startNewProject(): void {
    this.projectCreated = false;
    this.projectName = '';
    this.genre = '';
    this.storyIdea = '';
    this.messages = [];
    this.userInput = '';
  }

  // Speech-to-Text functionality
  toggleSpeechRecognition(): void {
    if (this.isListening) {
      this.stopSpeechRecognition();
    } else {
      this.startSpeechRecognition();
    }
  }

  startSpeechRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.notificationService.error('Error', 'Speech recognition is not supported in this browser');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.speechRecognition = new SpeechRecognition();
    
    this.speechRecognition.continuous = false;
    this.speechRecognition.interimResults = true; // Show interim results
    this.speechRecognition.lang = 'en-US';

    this.speechRecognition.onstart = () => {
      this.isListening = true;
      this.notificationService.success('Listening', 'Please speak now...');
      // Play a beep sound to indicate listening started
      this.playBeepSound();
    };

    this.speechRecognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Show interim results in input field
      if (interimTranscript) {
        this.userInput = finalTranscript + interimTranscript;
      }
      
      // When final result is available
      if (finalTranscript) {
        this.userInput = finalTranscript;
        this.isListening = false;
        this.notificationService.success('Success', 'Speech recognized! Processing...');
        // Play success sound
        this.playSuccessSound();
        // Auto-send the message after a short delay
        setTimeout(() => {
          this.sendMessage();
        }, 1000);
      }
    };

    this.speechRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.notificationService.error('Error', 'Speech recognition failed. Please try again.');
      this.playErrorSound();
    };

    this.speechRecognition.onend = () => {
      this.isListening = false;
    };

    this.speechRecognition.start();
  }

  stopSpeechRecognition(): void {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.isListening = false;
    }
  }

  // Text-to-Speech functionality
  speakMessage(text: string): void {
    if (this.isSpeaking) {
      this.stopSpeaking();
      return;
    }

    // Stop any current speech
    this.speechSynthesis.cancel();

    // Clean the text for TTS (remove markdown and asterisks)
    const cleanText = this.cleanTextForTTS(text);

    // Create new utterance
    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.rate = 0.9;
    this.currentUtterance.pitch = 1;
    this.currentUtterance.volume = 1;

    // Get available voices and set a good one
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && voice.name.includes('Google')
    ) || voices.find(voice => voice.lang.includes('en')) || voices[0];
    
    if (preferredVoice) {
      this.currentUtterance.voice = preferredVoice;
    }

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
    };

    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notificationService.error('Error', 'Speech synthesis failed');
    };

    this.speechSynthesis.speak(this.currentUtterance);
  }

  // Clean text for TTS (remove markdown and asterisks)
  private cleanTextForTTS(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
      .replace(/\*/g, '') // Remove any remaining asterisks
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  // Simple scroll to bottom
  scrollToBottom(): void {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Check if user is at bottom of messages
  private checkScrollPosition(): void {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      this.isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    }
  }

  stopSpeaking(): void {
    this.speechSynthesis.cancel();
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  // Sound feedback methods
  private playBeepSound(): void {
    try {
      const audioContext = new (window as any).AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Audio feedback not available');
    }
  }

  private playSuccessSound(): void {
    try {
      const audioContext = new (window as any).AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio feedback not available');
    }
  }

  private playErrorSound(): void {
    try {
      const audioContext = new (window as any).AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio feedback not available');
    }
  }
}
