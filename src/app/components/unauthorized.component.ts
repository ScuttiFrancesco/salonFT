import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h1>Accesso Negato</h1>
        <p>Non hai i permessi necessari per accedere a questa sezione.</p>
        <div class="actions">
          <button class="btn-primary" (click)="goBack()">Torna Indietro</button>
          <button class="btn-secondary" (click)="logout()">Logout</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .unauthorized-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .unauthorized-content {
      text-align: center;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      max-width: 400px;
    }

    .warning-icon {
      font-size: 4rem;
      color: #ff9800;
      margin-bottom: 20px;
    }

    h1 {
      color: #333;
      margin-bottom: 15px;
    }

    p {
      color: #666;
      margin-bottom: 30px;
    }

    .actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .btn-primary, .btn-secondary {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #8B4513;
      color: white;
    }

    .btn-secondary {
      background: #666;
      color: white;
    }

    .btn-primary:hover, .btn-secondary:hover {
      transform: translateY(-2px);
    }
  `
})
export class UnauthorizedComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    window.history.back();
  }

  logout(): void {
    this.authService.logout();
  }
}
