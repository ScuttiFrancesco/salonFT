import { Component, computed, OnInit, effect } from '@angular/core';
import { TableComponent } from './table.component';
import { DataService } from '../services/data.service';
import { log } from 'console';
import { interval } from 'rxjs';
import { Customer, TableCustomer } from '../models/customer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { DataType } from '../models/constants';
import { debounceTime } from 'rxjs/operators';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InputComponent } from './input.component';
import { AppointmentDetailComponent } from './appointment-detail.component';
import { AlertModalComponent } from './alert-modal.component';
import { ViewChild } from '@angular/core';
import {
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  DateAdapter,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { LOCALE_ID } from '@angular/core';
import { Appointment, TableAppointment } from '../models/appointment';
import { CustomerDetailComponent } from './customer-detail.component';

// Formato date personalizzato per NativeDateAdapter
const CUSTOM_NATIVE_DATE_FORMATS = {
  parse: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' }, // Permette l'input come gg/mm/aaaa
  },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' }, // Visualizza come DD/MM/YYYY nell'input
    monthYearLabel: { month: 'long', year: 'numeric' }, // Usa 'long' per il nome completo del mese
    dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' }, // Per accessibilità
    monthYearA11yLabel: { month: 'long', year: 'numeric' }, // Per accessibilità
  },
};

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    TableComponent,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    InputComponent,
    AppointmentDetailComponent,
    AlertModalComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    CustomerDetailComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: LOCALE_ID, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_NATIVE_DATE_FORMATS },
  ],
  template: `
    @defer (when righe.length > 0;) {
    <div [style.opacity]="opacity">
      <div class="title">Lista Appuntamenti</div>

      <div class="search-container">
        <app-input
          [placeholder]="'Cerca per nominativo'"
          [type]="'text'"
          [formControl]="nameInput"
        />
        <mat-form-field appearance="fill" style="width: 300px;">
          <mat-label>Inserisci un intervallo di date</mat-label>
          <mat-date-range-input
            [formGroup]="range"
            [rangePicker]="picker"
            [min]="minDate"
            [max]="maxDate"
          >
            <input
              matStartDate
              formControlName="start"
              placeholder="Data inizio"
            />
            <input
              matEndDate
              formControlName="end"
              placeholder="Data fine"
              (dateChange)="onDateChange()"
            />
          </mat-date-range-input>
          <mat-datepicker-toggle
            matSuffix
            [for]="picker"
          ></mat-datepicker-toggle>
          @if (range.get('start')?.value || range.get('end')?.value) {
          <button
            mat-icon-button
            matSuffix
            (click)="resetDateRange()"
            aria-label="Clear date range"
          >
            <mat-icon>close</mat-icon>
          </button>
          }
          <mat-date-range-picker #picker />
        </mat-form-field>

        <mat-icon class="add" (click)="formInsertAppointment()">add</mat-icon>
      </div>
      <app-table
        [icons]="['delete', 'info']"
        [colonne]="colonne"
        [righe]="righe"
        (info)="infoAppointment($event)"
        (delete)="delete($event)"
      ></app-table>
    </div>
    } @placeholder {
    <div class="loader-container">
      <mat-progress-spinner
        mode="indeterminate"
        [diameter]="32"
      ></mat-progress-spinner>
      <div class="loading">Caricamento...</div>
    </div>
    } @if (showAppointmentDetail) {
    <app-appointment-detail
      [appointment]="appointment()"
      (close)="showAppointmentDetail = false; opacity = 1"
      (update)="updateAppointment($event)"
      (delete)="delete($event)"
    />
    } @if(showAlertModal){
    <app-alert-modal
      [title]="'Elimina Appuntamento'"
      [confirmation]="true"
      (confirm)="confirmDeleting($event)"
      [message]="message"
    />

    }
  `,
  styles: `
  .add{
    font-size: 1.5rem;
    color:rgb(255, 255, 255);
    cursor: pointer;
    background-color: rgb(0, 145, 29);
    border-radius: 50px;
    padding: 5px;
  }
  .loader-container {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 200px;
}
mat-progress-spinner {
margin: 0 0 10px 0;
}
.title {
font-size: 1.75rem;
font-weight: 500;
margin: 20px;
//text-align: center;
color: rgb(75, 75, 75);;
}
.search-container {
display: flex;
justify-content: space-around;
align-items: center;
flex-direction: row;
margin: 20px;

}
input {
  border-radius: 5px;
}
error-message {
  color: red;
  font-size: 0.8rem;
}
  `,
})
export class AppointmentListComponent implements OnInit {
  customers = computed(() => this.dataService.customers());
  appointment = computed(() => this.dataService.appointment());
  colonne: string[] = ['Id', 'Cliente', 'Giorno', 'Ora', 'Durata', 'Telefono'];
  nameInput = new FormControl('');
  showAppointmentDetail = false;
  showCustomerDetail = false;
  showAlertModal = false;
  message: string = '';
  deletingAppointmentId: number | null = null;
  opacity = 1;
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  minDate: unknown;
  maxDate: unknown;
  range: FormGroup<any>;

  constructor(private dataService: DataService, private fb: FormBuilder) {
    this.range = this.fb.group({
      start: new FormControl(),
      end: new FormControl(),
    });
    effect(() => {
      const a = this.dataService.appointment();
      if (
        this.deletingAppointmentId != null &&
        a.id === this.deletingAppointmentId
      ) {
         let formattedDate = 'data sconosciuta';
        if (a.date) {
          try {
            const appointmentDate = new Date(a.date);
            formattedDate = appointmentDate.toLocaleDateString('it-IT', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            });
          } catch (error) {
            console.error('Errore nella formattazione della data', error);
          }
        }
        this.message = `Sei sicuro di voler eliminare appuntamento di ${a.customer?.name} ${a.customer?.surname} del ${formattedDate}?`;
        this.showAlertModal = true;
        this.deletingAppointmentId = null;
      }
    });
  }
  ngOnInit(): void {
    this.dataService.getAllData(DataType[DataType.APPOINTMENT].toLowerCase());
    this.nameInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (value) {
        this.range.reset();
        if (this.tableComponent) {
          this.tableComponent.pageIndex = 0;
        }

        this.dataService.getSearchedData(
          DataType[DataType.APPOINTMENT].toLowerCase() +
            `/retrieveAll/customer`,
          value ?? ''
        );
      }else{
        this.range.reset();
        this.dataService.filtredAppointments.set([]);
        this.dataService.getSearchedData(
          DataType[DataType.APPOINTMENT].toLowerCase() +
            `/retrieveAll/customer`,
          value ?? ''
        );
      }
    });
  }

  get righe(): TableAppointment[] {
    const searchValue = this.nameInput.value?.trim();
    const list =
      searchValue && searchValue.length > 0
        ? this.dataService.filtredAppointments()
        : this.dataService.appointments();
    if (!list || !Array.isArray(list) || list.length === 0) return [];

    return list.map((appointment) => ({
      id: appointment.id,
      customerName:
        appointment.customer?.name + ' ' + appointment.customer?.surname!,
      date: new Date(appointment.date).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      time: new Date(appointment.date).toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      duration: appointment.duration + ' min',
      phoneNumber: appointment.customer?.phoneNumber,
    }));
  }

  formInsertAppointment() {
    this.showAppointmentDetail = true;
    this.dataService.appointment.set({} as TableAppointment);
    this.opacity = 0.5;
    if (this.tableComponent) {
      this.tableComponent.pageIndex = 0;
    }
  }

  delete(idAppontment: number) {
    this.deletingAppointmentId = idAppontment;
    this.dataService.getDataById(
      DataType[DataType.APPOINTMENT].toLowerCase(),
      idAppontment
    );
    this.opacity = 0.5;
  }

  confirmDeleting(event: boolean) {
 if (event) {
      this.dataService.deleteData(
        DataType[DataType.APPOINTMENT].toLowerCase(),
        this.appointment().id
      );
      this.showAppointmentDetail = false;
    }
    this.showAlertModal = false;
    this.opacity = 1;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  resetDateRange() {
    this.range.reset();
    this.dataService.filtredAppointments.set([]);
    if (this.tableComponent) {
      this.tableComponent.pageIndex = 0;
    }
    if (this.nameInput.value) {
      this.dataService.getSearchedData(
        DataType[DataType.APPOINTMENT].toLowerCase() + `/retrieveAll/customer`,
        this.nameInput.value ?? ''
      );
    } else {
      this.dataService.getAllData(DataType[DataType.APPOINTMENT].toLowerCase());
    }
  }

  onDateChange() {
    const startDate = this.range.get('start')?.value;
    const endDate = this.range.get('end')?.value;

    console.log('Date range selected:', { startDate, endDate });

    if (startDate && endDate && this.range.valid) {
      const formattedStartDate = this.formatDate(new Date(startDate));
      const formattedEndDate = this.formatDate(new Date(endDate));

      if (this.dataService.filtredAppointments().length > 0) {
        this.dataService.filtredAppointments.set(
          this.dataService.filtredAppointments().filter((appointment) => {
            const appointmentDate = new Date(appointment.date);
            return (
              appointmentDate >= new Date(startDate) &&
              appointmentDate <= new Date(endDate)
            );
          })
        );
      } else {
        this.dataService.getAllData(
          DataType[DataType.APPOINTMENT].toLowerCase(),
          `date-range=${formattedStartDate}/${formattedEndDate}`
        );
      }

      if (this.tableComponent) {
        this.tableComponent.pageIndex = 0;
      }
    } else if (!startDate && !endDate) {
      this.dataService.filtredAppointments.set([]);
      if (this.tableComponent) {
        this.tableComponent.pageIndex = 0;
      }
    }
  }

  updateAppointment(appointment: Appointment) {
    if (!appointment) return;
    if (!appointment.id) {
      this.dataService.insertData(
        DataType[DataType.APPOINTMENT].toLowerCase(),
        appointment
      );
    } else {
      this.dataService.updateData(
        DataType[DataType.APPOINTMENT].toLowerCase(),
        appointment.id,
        appointment
      );
    }
    this.showAppointmentDetail = false;
    this.opacity = 1;
  }

  infoAppointment(idAppontment: number) {
    this.dataService.getDataById(
      DataType[DataType.APPOINTMENT].toLowerCase(),
      idAppontment
    );
    this.showAppointmentDetail = true;
    this.opacity = 0.5;
  }
}
