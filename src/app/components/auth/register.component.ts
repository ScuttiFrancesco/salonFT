import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { InputComponent } from '../input.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    InputComponent
  ],
  template: `
    <div class="register-container">
      <div class="register-form">
        <div class="logo">
          <mat-icon>content_cut</mat-icon>
          <h1>SalonFT</h1>
        </div>
        
        <h2>Crea il tuo account</h2>
        
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
          <div class="form-group">
            <app-input
              [placeholder]="'Nome'"
              [type]="'text'"
              formControlName="name"
              [messaggio]="getErrorMessage('name')"
              [style]="nameControl.invalid && nameControl.touched ? ['invalid'] : []"
            />
          </div>

          <div class="form-group">
            <app-input
              [placeholder]="'Cognome'"
              [type]="'text'"
              formControlName="surname"
              [messaggio]="getErrorMessage('surname')"
              [style]="surnameControl.invalid && surnameControl.touched ? ['invalid'] : []"
            />
          </div>
          
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
          
          <div class="form-group">
            <app-input
              [placeholder]="'Conferma Password'"
              [type]="'password'"
              formControlName="confirmPassword"
              [messaggio]="getErrorMessage('confirmPassword')"
              [style]="confirmPasswordControl.invalid && confirmPasswordControl.touched ? ['invalid'] : []"
            />
          </div>
          
          @if (errorMessage()) {
            <div class="error-message">
              {{ errorMessage() }}
            </div>
          }
          
          @if (successMessage()) {
            <div class="success-message">
              {{ successMessage() }}
            </div>
          }
          
          <button 
            type="submit" 
            class="btn-register"
            [disabled]="registerForm.invalid || authService.isLoading()"
          >
            @if (authService.isLoading()) {
              <mat-progress-spinner diameter="20"></mat-progress-spinner>
              Registrazione in corso...
            } @else {
              Registrati
            }
          </button>
        </form>
        
        <div class="footer-links">
          <a href="#" (click)="navigateToLogin($event)">Hai già un account? Accedi</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .register-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }

    .register-form {
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
        color: brown;
      }
      
      h1 {
        color: brown;
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

    .btn-register {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
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
        box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
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

    .success-message {
      color: #2e7d32;
      background: #e8f5e9;
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
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get nameControl() {
    return this.registerForm.get('name')!;
  }

  get surnameControl() {
    return this.registerForm.get('surname')!;
  }

  get emailControl() {
    return this.registerForm.get('email')!;
  }

  get passwordControl() {
    return this.registerForm.get('password')!;
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword')!;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.errorMessage.set('');
      this.successMessage.set('');
      
      const { confirmPassword, ...userData } = this.registerForm.value;
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          // response è ora un testo, non un oggetto JSON
          this.successMessage.set('Registrazione completata! Reindirizzamento al login...');
          
          // Reindirizza immediatamente al login dopo la registrazione
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500); // Ridotto il tempo di attesa a 1.5 secondi
        },
        error: (error) => {
          console.error('Register error:', error);
          
          // Gestisci il caso specifico dello status 201 con errore di parsing
          if (error.status === 201) {
            // La registrazione è andata a buon fine nonostante l'errore di parsing
            this.successMessage.set('Registrazione completata! Reindirizzamento al login...');
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
          } else {
            // Errore reale
            this.errorMessage.set(
              error.error?.message || error.message || 'Errore durante la registrazione. Riprova.'
            );
          }
        }
      });
    }
  }

  navigateToLogin(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);
    if (control?.errors && control?.touched) {
      if (control.errors['required']) {
        return 'Campo obbligatorio';
      }
      if (control.errors['email']) {
        return 'Email non valida';
      }
      if (control.errors['minlength']) {
        const fieldName = field === 'name' ? 'Nome' : field === 'surname' ? 'Cognome' : 'Campo';
        return `${fieldName}: minimo ${control.errors['minlength'].requiredLength} caratteri`;
      }
      if (control.errors['passwordMismatch']) {
        return 'Le password non coincidono';
      }
    }
    return '';
  }
}
