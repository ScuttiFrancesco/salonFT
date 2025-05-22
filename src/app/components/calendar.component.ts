import { Component, OnInit, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../services/data.service';
import { TableAppointment } from '../models/appointment';
import { DataType } from '../models/constants';
import { AppointmentDetailComponent } from './appointment-detail.component';
import { AlertModalComponent } from './alert-modal.component'; // Aggiungi import

interface AppointmentVisualProperties {
  top: string;
  left: string;
  width: string;
  height: number; // Raw numeric height
  heightPx: string; // Pixel string for ngStyle
  zIndex: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, DatePipe, AppointmentDetailComponent, AlertModalComponent],
  template: `
    <div class="calendar-container">
      <!-- Controlli di navigazione -->
      <div class="calendar-header">
        <h1 class="calendar-title">Agenda Settimanale</h1>
        <div class="calendar-nav">
          <button mat-icon-button (click)="previousWeek()">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="current-week">{{ formatWeekRange() }}</span>
          <button mat-icon-button (click)="nextWeek()">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <button mat-button (click)="goToToday()">Oggi</button>
        </div>
      </div>

      <!-- Calendario con vera tabella HTML -->
      <div class="calendar-scroll-container">
        <table class="calendar-table">
          <thead>
            <tr>
              <th class="time-column-header"></th>
              @for (day of weekDays; track day) {
                <th class="day-header" [class.today]="isToday(day.date)">
                  <div class="day-name">{{ day.name }}</div>
                  <div class="day-date">{{ day.date | date:'d MMM' }}</div>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (hour of hours; track hour) {
              <tr>
                <td class="hour-cell">{{ hour }}:00</td>
                @for (day of weekDays; track day) {
                  <td class="time-slot" [class.today]="isToday(day.date)" (click)="createAppointment(day.date, hour)">
                    <div class="time-slot-container">
                      @let appointmentsInCurrentSlot = getAppointmentsForSlot(day.date, hour);
                      @for (appointment of appointmentsInCurrentSlot; let i = $index; track appointment.id) {
                        @let visualProps = getCardVisualProperties(appointment, i, appointmentsInCurrentSlot);
                        <div 
                          class="appointment-card" 
                          [ngStyle]="{ top: visualProps.top, left: visualProps.left, width: visualProps.width, height: visualProps.heightPx, zIndex: visualProps.zIndex }"
                          [class.is-hovered]="appointment.id === hoveredAppointmentId"
                          (click)="openAppointment(appointment, $event)"
                          (mouseenter)="onAppointmentHover(appointment.id)"
                          (mouseleave)="onAppointmentLeave()"
                        >
                          <div class="appointment-header">
                            <span class="appointment-time">{{ appointment.date | date:'HH:mm' }}</span>
                            @if (appointment.id === hoveredAppointmentId || visualProps.height >= 40) {
                              <span class="appointment-customer">{{ getShortCustomerName(appointment) }}</span>
                            }
                            <span class="appointment-duration">{{ appointment.duration }} min</span>
                          </div>
                          @if (appointment.id === hoveredAppointmentId || visualProps.height >= 58) {
                            @if (appointment.services?.length) {
                              <div class="appointment-services">{{ appointment.services?.join(', ') }}</div>
                            }
                          }
                        </div>
                      }
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if(selectedAppointment) {
      <app-appointment-detail 
        [appointment]="selectedAppointment"
        (close)="closeAppointmentDetail()"
        (update)="updateAppointment($event)"
        (delete)="delete($event)"
      />
    }
    
    <!-- Aggiungi Alert Modal per conferma eliminazione -->
    @if(showAlertModal) {
      <app-alert-modal
        [title]="'Elimina Appuntamento'"
        [confirmation]="true"
        (confirm)="confirmDeleting($event)"
        [message]="message"
      />
    }
  `,
  styles: `
    .calendar-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 120px);
      overflow: hidden;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin: 20px;
    }

    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .calendar-title {
      font-size: 1.5rem;
      font-weight: 500;
      color: #333;
      margin: 0;
    }

    .calendar-nav {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .current-week {
      font-size: 16px;
      font-weight: 500;
      min-width: 180px;
      text-align: center;
    }

    .calendar-scroll-container {
      flex: 1;
      overflow-y: auto;
      position: relative;
    }
    
    .calendar-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed; /* Importante: forza le colonne ad avere larghezze uguali */
    }
    
    .time-column-header {
      width: 60px;
      min-width: 60px;
      border-bottom: 1px solid #e0e0e0; /* Aggiunto bordo inferiore */
    }
    
    .day-header {
      border-left: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0; /* Aggiunto bordo inferiore */
      border-top: 1px solid #e0e0e0; /* Aggiunto bordo superiore */
      padding: 12px 4px;
      text-align: center;
    }
    
    .day-header:first-child {
      border-left: none; /* Rimuove il bordo sinistro dalla prima cella */
    }
    
    /* Aggiungi bordo superiore alla prima riga di orari (8:00) */
    .calendar-table tbody tr:first-child .time-slot,
    .calendar-table tbody tr:first-child .hour-cell {
      border-top: 1px solid #e0e0e0;
    }
    
    .hour-cell {
      height: 60px;
      padding: 4px 8px;
      font-size: 0.8rem;
      color: #666;
      text-align: right;
      border-bottom: 1px solid #e0e0e0;
      background-color: #f9f9f9;
      width: 60px;
      min-width: 60px;
      border-right: 1px solid #e0e0e0;
      vertical-align: top;
    }
    
    .time-slot {
      height: 60px;
      border-bottom: 1px solid #e0e0e0;
      border-left: 1px solid #e0e0e0;
      position: relative;
      vertical-align: top;
      padding: 0;
    }
    
    .time-slot-container {
      position: relative;
      height: 100%;
      width: 100%;
    }
    
    .appointment-card {
      position: absolute;
      /* width, height, top, left are set by ngStyle */
      margin: 0; /* Adjusted from 1px 3px to allow full width use */
      background: #e3f2fd;
      border-left: 3px solid #1e88e5; /* Thinner border */
      border-radius: 3px; /* Smaller radius */
      padding: 1px 3px; /* Minimal padding */
      overflow: hidden;
      cursor: pointer;
      /* z-index is set by ngStyle */
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      transition: background-color 0.15s ease-out, box-shadow 0.15s ease-out; /* Height transition removed for now */
      box-sizing: border-box;
    }

    .appointment-card.is-hovered {
      background-color: #d1eaff; 
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    .appointment-header {
      display: flex;
      align-items: center; /* Align items vertically in the center */
      gap: 3px; 
      flex-wrap: nowrap; 
      width: 100%;
      line-height: 1.1; /* Very compact line height */
      min-height: 18px; /* Ensure header has some height */
    }
    
    .appointment-card.is-hovered .appointment-header {
      line-height: 1.3; /* Slightly more space on hover */
    }


    .appointment-time {
      font-size: 9px; 
      font-weight: bold;
      color: #1565c0; /* Darker blue */
      white-space: nowrap;
    }

    .appointment-customer { 
      font-size: 9px; 
      font-weight: 500;
      color: #212121; /* Darker text */
      flex-grow: 1; 
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 1px;
    }
    
    .appointment-duration {
      font-size: 9px; 
      color: #424242; 
      white-space: nowrap;
      margin-left: auto; 
    }
    
    .appointment-card.is-hovered .appointment-duration {
      margin-left: 0; 
    }

    .appointment-services { 
      font-size: 8px; 
      color: #333; 
      white-space: normal; /* Allow wrap for services if space */
      overflow: hidden; 
      text-overflow: ellipsis; 
      margin-top: 1px;
      line-height: 1.1;
      max-height: 30px; /* Limit height of services text area */
    }

    .today {
      background-color: #fffde7; 
    }
    
    .today .day-name,
    .today .day-date {
      color: #d32f2f;
      font-weight: 500;
    }
    
    @media (max-width: 1024px) {
      .week-header, .calendar-grid {
        grid-template-columns: 45px 1fr; 
      }
      .hour-cell {
        font-size: 0.7rem;
        padding: 4px 2px;
      }
    }
  `
})
export class CalendarComponent implements OnInit {
  weekStart: Date = new Date();
  weekDays: { date: Date, name: string }[] = [];
  hours: number[] = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00
  appointments: TableAppointment[] = [];
  selectedAppointment: TableAppointment | null = null;
  datePipe: DatePipe = new DatePipe('it-IT');
  public hoveredAppointmentId: number | null = null; // To track hovered appointment
  deletingAppointmentId: number | null = null;
  showAlertModal = false;
  message: string = '';
  opacity = 1; // Usato per l'opacità dello sfondo quando è aperta una modale

  constructor(private dataService: DataService) {
    // Inizializza weekStart alla domenica della settimana corrente
    this.weekStart = this.getWeekStart(new Date());
    this.generateWeekDays();
    
    // Aggiungi un effect che reagisce ai cambiamenti negli appuntamenti
    effect(() => {
      this.appointments = this.dataService.appointments();
      console.log("Appointments updated in calendar:", this.appointments);
    });
    
    // Effect per l'eliminazione di appuntamenti
    effect(() => {
      const selectedApp = this.dataService.appointment();
      if (this.deletingAppointmentId != null && selectedApp && selectedApp.id === this.deletingAppointmentId) {
        // Prepara il messaggio per l'alert
        const customerName = selectedApp.customer 
          ? `${selectedApp.customer.name} ${selectedApp.customer.surname}` 
          : "senza cliente";
        const appDate = new Date(selectedApp.date);
        const formattedDate = this.datePipe.transform(appDate, 'dd/MM/yyyy HH:mm');
        
        this.message = `Sei sicuro di voler eliminare l'appuntamento di ${customerName} del ${formattedDate}?`;
        this.showAlertModal = true;
        this.deletingAppointmentId = null;
      }
    });
  }

  ngOnInit() {
    // Carica gli appuntamenti
    this.loadAppointments();
  }

  loadAppointments() {
    // Qui dovremmo idealmente richiedere solo gli appuntamenti della settimana corrente
    this.dataService.getAllData(DataType[DataType.APPOINTMENT].toLowerCase());
    this.appointments = this.dataService.appointments();
  }

  getWeekStart(date: Date): Date {
    const newDate = new Date(date);
    const day = newDate.getDay();
    // Imposta al lunedì della settimana corrente (0 = Domenica in JavaScript)
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); 
    newDate.setDate(diff);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  generateWeekDays() {
    this.weekDays = [];
    const dayNames = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.weekStart);
      date.setDate(this.weekStart.getDate() + i);
      this.weekDays.push({
        date: date,
        name: dayNames[i]
      });
    }
  }

  previousWeek() {
    const newStart = new Date(this.weekStart);
    newStart.setDate(newStart.getDate() - 7);
    this.weekStart = newStart;
    this.generateWeekDays();
    this.loadAppointments();
  }

  nextWeek() {
    const newStart = new Date(this.weekStart);
    newStart.setDate(newStart.getDate() + 7);
    this.weekStart = newStart;
    this.generateWeekDays();
    this.loadAppointments();
  }

  goToToday() {
    this.weekStart = this.getWeekStart(new Date());
    this.generateWeekDays();
    this.loadAppointments();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }

  formatWeekRange(): string {
    const endDate = new Date(this.weekStart);
    endDate.setDate(endDate.getDate() + 6);
    
    if (this.weekStart.getMonth() === endDate.getMonth()) {
      return `${this.datePipe.transform(this.weekStart, 'd')} - ${this.datePipe.transform(endDate, 'd MMMM yyyy')}`;
    } else {
      return `${this.datePipe.transform(this.weekStart, 'd MMM')} - ${this.datePipe.transform(endDate, 'd MMM yyyy')}`;
    }
  }

  getAppointmentsForSlot(day: Date, hour: number): TableAppointment[] {
    return this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.getDate() === day.getDate() && 
             appointmentDate.getMonth() === day.getMonth() && 
             appointmentDate.getFullYear() === day.getFullYear() &&
             appointmentDate.getHours() === hour;
    });
  }

  getCardVisualProperties(appointment: TableAppointment, indexInSlot: number, appointmentsInSlot: TableAppointment[]): AppointmentVisualProperties {
    const appDate = new Date(appointment.date);
    const startMinute = appDate.getMinutes();
    const durationMinutes = parseInt(appointment.duration, 10) || 0; // Ensure duration is a number

    const slotPixelHeight = 60; 
    
    const topOffset = (startMinute / 60) * slotPixelHeight;

    let visualHeight = (durationMinutes / 60) * slotPixelHeight;

    if (this.hoveredAppointmentId !== appointment.id) {
      visualHeight = Math.max(visualHeight, 22); 
    } else {
      visualHeight = Math.max(visualHeight, 58); 
    }
    
    const totalInSlot = appointmentsInSlot.length;
    const widthPercentage = totalInSlot > 0 ? (100 / totalInSlot) : 100;
    const leftPercentage = indexInSlot * widthPercentage;

    return {
      top: `${topOffset}px`,
      left: `${leftPercentage}%`,
      width: `${widthPercentage}%`,
      height: visualHeight, // Return raw number
      heightPx: `${visualHeight}px`, // Return pixel string for style
      zIndex: (this.hoveredAppointmentId === appointment.id) ? 20 : (indexInSlot + 2)
    };
  }

  onAppointmentHover(appointmentId: number): void {
    this.hoveredAppointmentId = appointmentId;
  }

  onAppointmentLeave(): void {
    this.hoveredAppointmentId = null;
  }

  createAppointment(date: Date, hour: number) {
    const appointmentTime = new Date(date);
    appointmentTime.setHours(hour, 0, 0, 0);
    
    this.selectedAppointment = {
      id: 0,
      date: appointmentTime.toISOString(),
      duration: '60',
      services: [],
      notes: '',
      customer: undefined
    };
  }

  openAppointment(appointment: TableAppointment, event: MouseEvent) {
    event.stopPropagation(); // Previene che l'evento raggiunga il time-slot
    this.selectedAppointment = appointment;
  }

  closeAppointmentDetail() {
    this.selectedAppointment = null;
  }

  updateAppointment(appointment: any) {
    if (appointment.id === 0) {
      this.dataService.insertData(DataType[DataType.APPOINTMENT].toLowerCase(), appointment);
    } else {
      this.dataService.updateData(
        DataType[DataType.APPOINTMENT].toLowerCase(), 
        appointment.id, 
        appointment
      );
    }
    this.closeAppointmentDetail();
   
  }

  // Aggiungi questo metodo per ottenere il formato abbreviato del nome cliente
  getShortCustomerName(appointment: TableAppointment): string {
    if (!appointment.customer) return '';
    
    const surname = appointment.customer.surname || '';
    const name = appointment.customer.name || '';
    const initial = name.length > 0 ? name[0] : '';
    
    return `${surname} ${initial}.`;
  }

  
  delete(idAppointment: number) {
    this.deletingAppointmentId = idAppointment;
    this.dataService.getDataById(
      DataType[DataType.APPOINTMENT].toLowerCase(),
      idAppointment
    );
  }

 
  confirmDeleting(event: boolean) {
    if (event) {
      this.dataService.deleteData(
        DataType[DataType.APPOINTMENT].toLowerCase(),
        this.dataService.appointment().id
      );
    }
    this.showAlertModal = false;
   this.closeAppointmentDetail();
  }
}
