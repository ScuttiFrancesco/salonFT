import { Component, computed, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar.component';
import { DataService } from './services/data.service';
import { AlertModalComponent } from "./components/alert-modal.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, AlertModalComponent],
  template: `
    <app-navbar />   <div style="width: 100wv; height: 100hw" [style.opacity]="messaggioErrore() || messaggioSuccesso() ? 0.5 : 1">
    <router-outlet /> </div>
    @if(messaggioErrore()){
    <app-alert-modal [title]="'Messaggio di Errore'" [message]="messaggioErrore()" (confirm)="closeAlert()"/>
  }
    @if(messaggioSuccesso()){
    <app-alert-modal [title]="'Messaggio di Conferma'" [message]="messaggioSuccesso()" (confirm)="closeAlert()" [titleStyle]="'green'"/>}
  `,
  styles: [],
})
export class AppComponent {
  title = 'salonFT';
  messaggioErrore = computed(() => this.dataService.messaggioErrore());
  messaggioSuccesso = computed(() => this.dataService.messaggioSuccesso());
  constructor(private dataService: DataService) {   
  }

  closeAlert() {
    this.dataService.messaggioErrore.set('');
    this.dataService.messaggioSuccesso.set('');
  }
 }
