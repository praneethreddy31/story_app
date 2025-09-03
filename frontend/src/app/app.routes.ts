import { Routes } from '@angular/router';
import { StoryDashboardComponent } from './components/story-dashboard/story-dashboard';
import { ProjectManagerComponent } from './components/project-manager/project-manager';
import { StoryTellerComponent } from './components/ai-chat/ai-chat';
import { ProjectDetailComponent } from './components/project-detail/project-detail';
import { LoginComponent } from './components/auth/login/login';
import { SignupComponent } from './components/auth/signup/signup';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { 
    path: 'dashboard', 
    component: StoryDashboardComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'projects', 
    component: ProjectManagerComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'projects/:id', 
    component: ProjectDetailComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'story-teller', 
    component: StoryTellerComponent, 
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: '/login' }
];
