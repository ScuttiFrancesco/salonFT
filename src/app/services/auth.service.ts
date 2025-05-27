import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { API_URL, AUTH_URL } from '../models/constants';
import { StorageService } from './storage.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // secondi
  role: string;
  username: string;
}

export interface User {
  id?: number;
  email: string;
  role: string;
  name?: string;
  surname?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  private storageService = inject(StorageService);

  // Signals per lo stato dell'autenticazione
  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<User | null>(null);
  private _isLoading = signal<boolean>(false);

  // Computed signals
  readonly isAuthenticated = computed(() => this._isAuthenticated());
  readonly currentUser = computed(() => this._currentUser());
  readonly isLoading = computed(() => this._isLoading());
  readonly userRole = computed(() => this._currentUser()?.role || null);
  readonly isAdmin = computed(() => this.userRole() === 'ROLE_ADMIN');
  readonly isUser = computed(() => this.userRole() === 'ROLE_USER');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Inizializza lo stato solo se siamo nel browser
    if (this.storageService.isAvailable) {
      this._isAuthenticated.set(this.hasValidToken());
      this._currentUser.set(this.getUserFromStorage());
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this._isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${AUTH_URL}/login`, credentials).pipe(
      tap(response => {
        this.setAuthData(response);
        this._isAuthenticated.set(true);
        // Crea l'oggetto User dalla risposta del backend
        const user: User = {
          email: credentials.email,
          role: response.role,
          name: response.username // Usiamo username dal backend come name
        };
        this._currentUser.set(user);
        this._isLoading.set(false);
      }),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  register(userData: { email: string; password: string; name: string; surname: string }): Observable<any> {
    this._isLoading.set(true);
    
    return this.http.post(`${AUTH_URL}/register`, userData, { 
      responseType: 'text' // Specifica che ci aspettiamo una risposta di testo
    }).pipe(
      tap((response) => {
        this._isLoading.set(false);
        // La risposta è già un testo, non c'è bisogno di parsare JSON
        console.log('Registrazione completata:', response);
      }),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.error('No refresh token available');
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('=== REFRESH TOKEN REQUEST ===');
    console.log('Attempting to refresh token...');
    
    // URL del refresh token
    const refreshUrl = `${AUTH_URL}/refresh-token`;
    
    console.log('Making refresh request to:', refreshUrl);
    console.log('Refresh token (first 20 chars):', refreshToken.substring(0, 20) + '...');
    
    // Invia il refresh token in ENTRAMBI i posti per essere sicuri
    const requestBody = { refreshToken: refreshToken };
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`
    };
    
    console.log('Request body:', requestBody);
    console.log('Request headers:', requestHeaders);
    
    return this.http.post<{ accessToken: string }>(refreshUrl, requestBody, {
      headers: requestHeaders
    }).pipe(
      tap(response => {
        console.log('=== REFRESH TOKEN SUCCESS ===');
        console.log('Token refresh successful, new access token received');
        console.log('New access token (first 20 chars):', response.accessToken.substring(0, 20) + '...');
        
        // Verifica la validità del nuovo token
        try {
          const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          const expiresIn = payload.exp - currentTime;
          console.log('New token expires in:', expiresIn, 'seconds');
          console.log('New token expiry time:', new Date(payload.exp * 1000).toISOString());
        } catch (error) {
          console.error('Error parsing new token:', error);
        }
        
        this.storageService.setItem(this.TOKEN_KEY, response.accessToken);
      }),
      catchError(error => {
        console.error('=== REFRESH TOKEN FAILED ===');
        console.error('Refresh token request failed:', error);
        console.error('Error status:', error.status);
        console.error('Error details:', error.error);
        
        // Clear tokens on refresh failure
        this.storageService.removeItem(this.TOKEN_KEY);
        this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    // Clear storage
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.REFRESH_TOKEN_KEY);
    this.storageService.removeItem(this.USER_KEY);
    
    // Reset signals
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this._isLoading.set(false);
    
    // Navigate to login
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return this.storageService.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.storageService.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setAuthData(authResponse: AuthResponse): void {
    this.storageService.setItem(this.TOKEN_KEY, authResponse.accessToken);
    this.storageService.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
    
    // Salva i dati utente estratti dalla risposta
    const userData: User = {
      email: '', // Sarà settato nel login method
      role: authResponse.role,
      name: authResponse.username // Usiamo username come name
    };
    this.storageService.setItem(this.USER_KEY, JSON.stringify(userData));
  }

  private hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  private getUserFromStorage(): User | null {
    const userData = this.storageService.getItem(this.USER_KEY);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
}
