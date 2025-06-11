import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">
        <mat-icon class="brand-icon">content_cut</mat-icon>
        <span class="brand-text" routerLink="/home" style="cursor: pointer;">Il tuo Salone</span>
      </div>
      
      <div class="nav-links">
        @if (!authService.isAuthenticated()) {
          <a routerLink="/home" routerLinkActive="active">Home</a>
          <a routerLink="/login" class="login-btn">Accedi</a>
        } @else {
          @if (authService.isAdmin()) {
            <a routerLink="/admin/customers" routerLinkActive="active">Clienti</a>
            <a routerLink="/admin/appointments" routerLinkActive="active">Appuntamenti</a>
            <a routerLink="/admin/receipts" routerLinkActive="active">Ricevute</a>
            <a routerLink="/admin/calendar" routerLinkActive="active">Calendario</a>
          } @else {
            
            <a routerLink="/user/calendar" routerLinkActive="active">Calendario</a>
          }
          
          <div class="user-menu">
            <button mat-icon-button [matMenuTriggerFor]="userMenuRef">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenuRef="matMenu">
              <div class="user-info">
                <strong>{{ authService.currentUser()?.name || authService.currentUser()?.email }}</strong>
                <small>{{ authService.currentUser()?.role }}</small>
              </div>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                Logout
              </button>
            </mat-menu>
          </div>
        }
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: linear-gradient(135deg,rgb(142, 35, 35) 0%, brown 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.5rem;
      font-weight: 700;
      cursor: pointer;
    }

    .brand-icon {
      font-size: 1.5rem;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.3s ease;
      font-weight: 500;
    }

    .nav-links a:hover,
    .nav-links a.active {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .login-btn {
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .login-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    .user-menu button {
      color: white;
    }

    .user-info {
      padding: 8px 16px;
      border-bottom: 1px solid #eee;
      margin-bottom: 8px;
    }

    .user-info strong {
      display: block;
      margin-bottom: 4px;
    }

    .user-info small {
      color: #666;
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 8px 16px;
      }
      
      .nav-links {
        gap: 12px;
      }
      
      .nav-links a {
        padding: 6px 12px;
        font-size: 0.9rem;
      }
    }
  `
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    console.log('User initiated logout');
    this.authService.logout();
  }
}
