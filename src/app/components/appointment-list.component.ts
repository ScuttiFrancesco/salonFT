import {
  Component,
  computed,
  OnInit,
  effect,
  ChangeDetectionStrategy,
  OnDestroy,
  signal,
} from '@angular/core';
import { TableComponent } from './table.component';
import { DataService } from '../services/data.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CUSTOM_NATIVE_DATE_FORMATS,
  CustomerSearchDirection,
  CustomerSearchType,
  DataType,
} from '../models/constants';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InputComponent } from './input.component';
import { AppointmentDetailComponent } from './appointment-detail.component';
import { AlertModalComponent } from './alert-modal.component';
import { ViewChild } from '@angular/core';
import {
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { LOCALE_ID } from '@angular/core';
import { Appointment, TableAppointment } from '../models/appointment';
import { PaginationComponent } from './pagination.component';
import { ReceiptComponent } from './receipt.component';
import { Receipt } from '../models/receipt';
import { AuthService } from '../services/auth.service';



@Component({
  selector: 'app-appointment-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableComponent,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    InputComponent,
    AlertModalComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    PaginationComponent,
    AppointmentDetailComponent,
    ReceiptComponent,
  ],

  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: LOCALE_ID, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_NATIVE_DATE_FORMATS },
  ],
  template: `
    @defer (when righeComputed().length > 0;) {
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
          <mat-date-range-input [formGroup]="range" [rangePicker]="picker">
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
        [righe]="righeComputed()"
        (info)="infoAppointment($event)"
        (delete)="delete($event)"
        (orderBy)="orderBy($event)"
        [trackByFn]="trackByAppointmentId"
      >
        <app-pagination
          [currentPage]="appointmentPagination().currentPage"
          [totalPages]="appointmentPagination().totalPages"
          [currentPageSize]="pagSize"
          (nextPage)="nextPage()"
          (prevPage)="prevPage()"
          (firstPage)="initialData(getSearchEndpoint())"
          (lastPage)="lastPage()"
          (pageSize)="pageSize($event)"
        >
        </app-pagination>
      </app-table>
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
      (addReceipt)="formReceipt($event)"
    />
    } @if(showAlertModal()){
    <app-alert-modal
      [title]="'Elimina Appuntamento'"
      [confirmation]="true"
      (confirm)="confirmDeleting($event)"
      [message]="message()"
    />
    } @if (showReceipt) {
    <app-receipt
      [receipt]="receipt!"
      (close)="showReceipt = false; opacity = 1"
      (delete)="delete($event)"
      (update)="saveReceipt($event)"
    />}
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
export class AppointmentListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  receipt: Receipt | undefined;
  customers = computed(() => this.dataService.customers());
  appointment = computed(() => this.dataService.appointment());
  appointments = computed(() => this.dataService.appointments());
  appointmentPagination = computed(() =>
    this.dataService.appointmentPagination()
  );

  // Computed per le righe ottimizzato
  righeComputed = computed(() => {
    const appointments = this.appointments();
    if (
      !appointments ||
      !Array.isArray(appointments) ||
      appointments.length === 0
    ) {
      return [];
    }

    return appointments.map((appointment) => ({
      id: appointment.id,
      customerName: `${appointment.customer?.name || ''} ${
        appointment.customer?.surname || ''
      }`.trim(),
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
      phoneNumber: appointment.customer?.phoneNumber || '',
    }));
  });

  colonne: string[] = ['Id', 'Cliente', 'Giorno', 'Ora', 'Durata', 'Telefono'];
  nameInput = new FormControl('');
  showAppointmentDetail = false;
  showCustomerDetail = false;
  showReceipt = false;
 showAlertModal = signal(false); // Changed to signal
   message = signal(''); 
  deletingAppointmentId: number | null = null;
  opacity = 1;
  currentPageSize = 10;
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  range: FormGroup<any>;
  pagSize = 5;

  // TrackBy function per ottimizzare le liste
  trackByAppointmentId = (index: number, item: any) => item.id;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
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
              day: '2-digit',
            });
          } catch (error) {
            console.error('Errore nella formattazione della data', error);
          }
        }
        this.message.set( `Sei sicuro di voler eliminare l' appuntamento di ${a.customer?.name} ${a.customer?.surname} del ${formattedDate}?`);
        this.showAlertModal.set(true);
        this.deletingAppointmentId = null;
      }
    },
      { allowSignalWrites: true }
    ); 
  }

  ngOnInit(): void {
    // Verifica autenticazione prima di caricare i dati
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, skipping data load');
      return;
    }

    this.initialData();

    // Debounce aumentato a 1000ms per ridurre le chiamate
    this.nameInput.valueChanges
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (this.authService.isAuthenticated()) {
          this.initialData(this.getSearchEndpoint());
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initialData(value: string = '') {
    // Controllo autenticazione prima di ogni chiamata
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, cannot load data');
      return;
    }

    if (value !== '') {
      this.dataService.getAllDataPaginated(
        value,
        DataType.APPOINTMENT,
        1,
        this.pagSize,
        CustomerSearchType.ID,
        CustomerSearchDirection.ASC
      );
    } else {
      this.dataService.getAllDataPaginated(
        'retrieveAll/paginated',
        DataType.APPOINTMENT,
        1,
        this.pagSize,
        CustomerSearchType.ID,
        CustomerSearchDirection.ASC
      );
    }
  }

  get righe(): TableAppointment[] {
    // Deprecato - usa righeComputed() invece
    return this.righeComputed();
  }

  formInsertAppointment() {
    this.showAppointmentDetail = true;
    this.dataService.appointment.set({} as TableAppointment);
    this.opacity = 0.5;
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
    }
    this.showAlertModal.set(false);
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
    // Dopo aver resettato le date, ricarica con il filtro nome se presente
    this.initialData(this.getSearchEndpoint());
  }

  onDateChange() {
    const startDate = this.range.get('start')?.value;
    const endDate = this.range.get('end')?.value;

    if (startDate && endDate && this.range.valid) {
      // Se entrambe le date sono selezionate, aggiorna i dati
      let endpoint = this.getSearchEndpoint();
      this.dataService.getAllDataPaginated(
        endpoint,
        DataType.APPOINTMENT,
        1, // Torna sempre alla prima pagina quando cambiano i filtri
        this.pagSize,
        CustomerSearchType.ID,
        CustomerSearchDirection.ASC
      );
    } else if (!startDate && !endDate) {
      // Se le date sono state cancellate, aggiorna con solo il filtro nome (se presente)
      let endpoint = this.getSearchEndpoint();
      this.dataService.getAllDataPaginated(
        endpoint,
        DataType.APPOINTMENT,
        1,
        this.pagSize,
        CustomerSearchType.ID,
        CustomerSearchDirection.ASC
      );
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

  nextPage() {
    if (!this.authService.isAuthenticated()) return;
    
    let endpoint = this.getSearchEndpoint();
    this.dataService.getAllDataPaginated(
      endpoint,
      DataType.APPOINTMENT,
      this.appointmentPagination().currentPage + 1,
      this.pagSize,
      this.appointmentPagination().sortBy,
      this.appointmentPagination().sortDirection
    );
  }

  prevPage() {
    if (!this.authService.isAuthenticated()) return;
    
    let endpoint = this.getSearchEndpoint();
    this.dataService.getAllDataPaginated(
      endpoint,
      DataType.APPOINTMENT,
      this.appointmentPagination().currentPage - 1,
      this.pagSize,
      this.appointmentPagination().sortBy,
      this.appointmentPagination().sortDirection
    );
  }

  orderBy(col: string) {
    let colIndex: number = 0;
    let endpoint = this.getSearchEndpoint(); // Usa l'endpoint corrente invece di 'retrieveAll/paginated'
    
    switch (col) {
      case 'Id':
        colIndex = 0;
        break;
      case 'Giorno':
        colIndex = 1;
        break;
      case 'Cliente':
        colIndex = 2;
        break;
      case 'Durata':
        colIndex = 4;
        break;
    }
    
    // Ottieni la direzione corrente e invertila
    const currentDirection = this.appointmentPagination().sortDirection;
    const newDirection = currentDirection === CustomerSearchDirection.ASC
      ? CustomerSearchDirection.DESC
      : CustomerSearchDirection.ASC;
    
    console.log('Appointment OrderBy - Column:', col, 'Index:', colIndex, 'Current Direction:', currentDirection, 'New Direction:', newDirection, 'Endpoint:', endpoint);
    
    this.dataService.getAllDataPaginated(
      endpoint, // Usa l'endpoint con filtri
      DataType.APPOINTMENT,
      1,
      this.pagSize,
      colIndex,
      newDirection
    );
  }

  pageSize(size: number) {
    // Non resettare più i filtri quando cambia la dimensione della pagina
    this.pagSize = size;

    // Mantieni i filtri attivi quando cambia la dimensione della pagina
    let endpoint = this.getSearchEndpoint();

    this.dataService.getAllDataPaginated(
      endpoint,
      DataType.APPOINTMENT,
      1,
      this.pagSize,
      this.appointmentPagination().sortBy,
      this.appointmentPagination().sortDirection
    );
  }

  lastPage() {
    let endpoint = this.getSearchEndpoint();
    this.dataService.getAllDataPaginated(
      endpoint,
      DataType.APPOINTMENT,
      this.appointmentPagination().totalPages,
      this.pagSize,
      this.appointmentPagination().sortBy,
      this.appointmentPagination().sortDirection
    );
  }

  getSearchEndpoint(): string {
    const startDate = this.range.get('start')?.value;
    const endDate = this.range.get('end')?.value;
    const nameValue = this.nameInput.value?.trim();

    // Se abbiamo sia nome che date
    if (nameValue && startDate && endDate) {
      const formattedStartDate = this.formatDate(new Date(startDate));
      const formattedEndDate = this.formatDate(new Date(endDate));
      return `dateRange=${formattedStartDate}/${formattedEndDate}/customerName=${nameValue}`;
    }
    // Se abbiamo solo le date
    else if (startDate && endDate) {
      const formattedStartDate = this.formatDate(new Date(startDate));
      const formattedEndDate = this.formatDate(new Date(endDate));
      return `dateRange=${formattedStartDate}/${formattedEndDate}`;
    }
    // Se abbiamo solo il nome
    else if (nameValue) {
      return `searchByCustomerName=${nameValue}`;
    }
    // Nessun filtro
    return 'retrieveAll/paginated';
  }

  formReceipt(appointment: TableAppointment) {
    this.receipt = {
      notes: appointment.notes || '',
      services: appointment.services || [],
      total: 0,
      paymentMethod: '',
      id: 0,
      customerName: appointment.customer?.name || '',
      customerSurname: appointment.customer?.surname || '',
      customerAddress: appointment.customer?.address || '',
      customerEmail: appointment.customer?.email || '',
      customerPhoneNumber: appointment.customer?.phoneNumber || '',
      appointmentId: appointment.id,
      appointmentDate: appointment.date,
      date: new Date().toISOString(),
    }; 
    
    this.showReceipt = true;
    this.showAppointmentDetail = false;
    this.opacity = 0.5;  
  }

  saveReceipt(receipt: Receipt) {

    if (!receipt) return;

    if (!receipt.id) {
      this.dataService.insertData(
        DataType[DataType.RECEIPT].toLowerCase(),
        receipt
      );
    } else {
      this.dataService.updateData(
        DataType[DataType.RECEIPT].toLowerCase(),
        receipt.id,
        receipt
      );
    }

    this.showReceipt = false;    
    this.opacity = 1;  
  }
}
