import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <mat-toolbar>
      <div>SALON</div>
      <button mat-raised-button routerLink="/">
        <mat-icon>home</mat-icon> Home
      </button>
      <span class="spacer"></span>
      <button mat-raised-button routerLink="/calendar">
        <mat-icon>date_range</mat-icon> Agenda
      </button>
      <button mat-raised-button routerLink="/appointment-list">
        <mat-icon>call</mat-icon> Appuntamenti
      </button>
      <button mat-raised-button routerLink="/customer-list">
        <mat-icon>people </mat-icon> Clienti
      </button>
      <mat-icon>logout</mat-icon>
    </mat-toolbar>
  `,
  styles: `
    mat-toolbar {
      background-color: rgb(233, 233, 233);
      color: white;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      height: 80px;
    }

    div {
      font-size: 2.75rem;
      font-weight: bold;
      color: brown;
      letter-spacing: 5px;
      margin: 0;
      text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.3);
    }

    .spacer {
      flex: 1 1 auto;
    }

 

    mat-icon {
      color: rgba(0, 0, 0, 0.51);
      font-size: 1.75rem;
      cursor: pointer;
    }
  `,
})
export class NavbarComponent {}
