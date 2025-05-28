import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content">
          <h1>
            <mat-icon class="hero-icon">content_cut</mat-icon>
            Benvenuto in SalonFT
          </h1>
          <p class="hero-subtitle">
            La piattaforma completa per la gestione del tuo salone di bellezza
          </p>
          
          @if (!authService.isAuthenticated()) {
            <div class="cta-buttons">
              <a routerLink="/login" mat-raised-button color="primary" class="cta-button">
                Accedi
              </a>
              <a routerLink="/register" mat-raised-button class="cta-button secondary">
                Registrati
              </a>
            </div>
          } @else {
            <div class="welcome-message">
              <h2>Bentornato, {{ authService.currentUser()?.name }}!</h2>
              @if (authService.isAdmin()) {
                <p>Accedi alle funzioni di amministratore:</p>
                <div class="admin-links">
                  <a routerLink="/admin/customers" mat-raised-button>Gestione Clienti</a>
                  <a routerLink="/admin/appointments" mat-raised-button>Gestione Appuntamenti</a>
                  <a routerLink="/admin/calendar" mat-raised-button>Calendario</a>
                </div>
              } @else {
                <p>Prendi visione degli appuntamenti:</p>
                <div class="user-links">
                  <a routerLink="/user/calendar" mat-raised-button>Calendario</a>
                </div>
              }
            </div>
          }
        </div>
      </div>
      
      <div class="features-section">
        <h2>Funzionalità</h2>
        <div class="features-grid">
          <div class="feature-card">
            <mat-icon>people</mat-icon>
            <h3>Gestione Clienti</h3>
            <p>Mantieni un database completo dei tuoi clienti con tutte le informazioni necessarie</p>
          </div>
          <div class="feature-card">
            <mat-icon>event</mat-icon>
            <h3>Prenotazioni</h3>
            <p>Gestisci facilmente gli appuntamenti e ottimizza la pianificazione del tuo tempo</p>
          </div>
          <div class="feature-card">
            <mat-icon>calendar_month</mat-icon>
            <h3>Calendario</h3>
            <p>Visualizza tutti gli appuntamenti in un calendario intuitivo e facile da usare</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .home-container {
      min-height: calc(100vh - 80px);
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .hero-section {
      text-align: center;
      padding: 80px 20px;
      background: white;
      margin-bottom: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .hero-content h1 {
      font-size: 3rem;
      color: brown;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }

    .hero-icon {
      font-size: 1.65rem !important;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      color: #666;
      margin-bottom: 40px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-buttons {
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-button {
      font-size: 1.1rem;
      padding: 12px 30px;
      text-decoration: none;
    }

    .cta-button.secondary {
      background-color: #666;
      color: white;
    }

    .welcome-message {
      max-width: 600px;
      margin: 0 auto;
    }

    .welcome-message h2 {
      color: brown;
      margin-bottom: 15px;
    }

    .admin-links, .user-links {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .admin-links a, .user-links a {
      text-decoration: none;
      background-color: brown;
      color: white;
    }

    .features-section {
      padding: 60px 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .features-section h2 {
      text-align: center;
      font-size: 2.5rem;
      color: brown;
      margin-bottom: 50px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }

    .feature-card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-card mat-icon {
      font-size: 3rem;
      color: brown;
      margin-bottom: 15px;
    }

    .feature-card h3 {
      color: #333;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }

    .feature-card p {
      color: #666;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 10px;
      }

      .hero-icon {
        font-size: 2.5rem !important;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .admin-links, .user-links {
        flex-direction: column;
      }
    }
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // Verifica lo stato di autenticazione all'avvio
    if (this.authService.isAuthenticated()) {
      // Verifica che i token siano ancora validi
      const token = this.authService.getAccessToken();
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          const timeUntilExpiry = payload.exp - currentTime;
          
          if (timeUntilExpiry <= 0) {
            console.log('Token expired on home page, logging out');
            this.authService.logout();
          }
        } catch (error) {
          console.error('Invalid token on home page, logging out');
          this.authService.logout();
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
