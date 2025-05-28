import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { InputComponent } from '../input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    InputComponent
  ],
  template: `
    <div class="login-container">
      <div class="login-form">
        <div class="logo">
          <mat-icon>content_cut</mat-icon>
          <h1>SalonFT</h1>
        </div>
        
        <h2>Accedi al tuo account</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
          <div class="form-group">
            <app-input
              [placeholder]="'Email'"
              [type]="'email'"
              formControlName="email"
              [messaggio]="getErrorMessage('email')"
              [style]="emailControl.invalid && emailControl.touched ? ['invalid'] : []"
            />
          </div>
          
          <div class="form-group">
            <app-input
              [placeholder]="'Password'"
              [type]="'password'"
              formControlName="password"
              [messaggio]="getErrorMessage('password')"
              [style]="passwordControl.invalid && passwordControl.touched ? ['invalid'] : []"
            />
          </div>
          
          @if (errorMessage()) {
            <div class="error-message">
              {{ errorMessage() }}
            </div>
          }
          
          <button 
            type="submit" 
            class="btn-login"
            [disabled]="loginForm.invalid || authService.isLoading()"
          >
            @if (authService.isLoading()) {
              <mat-progress-spinner diameter="20"></mat-progress-spinner>
              Accesso in corso...
            } @else {
              Accedi
            }
          </button>
        </form>
        
        <div class="footer-links">
          <a href="#" (click)="navigateToRegister($event)">Non hai un account? Registrati</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .login-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }

    .login-form {
      width: 100%;
      max-width: 400px;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 30px;
      gap: 10px;
      
      mat-icon {
        font-size: 1.65rem;
        color:brown;
      }
      
      h1 {
        color:brown;
        margin: 0;
        font-weight: 700;
        font-size: 2rem;
      }
    }

    h2 {
      color: #333;
      margin-bottom: 30px;
      font-weight: 500;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 20px;
      text-align: left;
    }

    .btn-login {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, brown 0%,rgb(130, 37, 37) 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
    }

    .error-message {
      color: #d32f2f;
      background: #ffebee;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 20px;
      font-size: 0.9rem;
    }

    .footer-links {
      margin-top: 20px;
      
      a {
        color: brown;
        text-decoration: none;
        font-size: 0.9rem;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    mat-progress-spinner {
      width: 20px !important;
      height: 20px !important;
    }
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get emailControl() {
    return this.loginForm.get('email')!;
  }

  get passwordControl() {
    return this.loginForm.get('password')!;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.errorMessage.set('');
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // Navigate based on user role
          if (response.role === 'ROLE_ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/user']);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage.set(
            error.error?.message || 'Errore durante il login. Riprova.'
          );
        }
      });
    }
  }

  navigateToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/register']);
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.errors && control?.touched) {
      if (control.errors['required']) {
        return 'Campo obbligatorio';
      }
      if (control.errors['email']) {
        return 'Email non valida';
      }
      if (control.errors['minlength']) {
        return `Minimo ${control.errors['minlength'].requiredLength} caratteri`;
      }
    }
    return '';
  }
}
