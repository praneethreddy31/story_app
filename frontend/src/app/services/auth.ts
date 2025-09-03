import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return;
    }
    
    // Check if token is valid without calling isAuthenticated to avoid circular dependency
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        this.logout();
        return;
      }
      
      // Token is valid, load user
      const user: User = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        createdAt: payload.createdAt
      };
      this.currentUserSubject.next(user);
    } catch (error) {
      // Invalid token, clear it
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.backendUrl}/api/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.data.token);
          this.currentUserSubject.next(response.data.user);
        })
      );
  }

  signup(userData: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.backendUrl}/api/auth/register`, userData)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.data.token);
          this.currentUserSubject.next(response.data.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  validateToken(): Observable<boolean> {
    return this.http.get<{success: boolean, data: {valid: boolean}}>(`${environment.backendUrl}/api/auth/validate`)
      .pipe(
        map((response: {success: boolean, data: {valid: boolean}}) => response.data.valid),
        catchError(() => {
          this.logout();
          return of(false);
        })
      );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      if (payload.exp && payload.exp < currentTime) {
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  clearInvalidToken(): void {
    const token = this.getToken();
    if (token && !this.isAuthenticated()) {
      this.logout();
    }
  }

  forceClearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }
}
