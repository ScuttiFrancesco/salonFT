import { Component, input, output, effect } from '@angular/core';
import { Customer } from '../models/customer';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from './input.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Appointment, TableAppointment } from '../models/appointment';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { DataType } from '../models/constants';
import { CustomerDetailComponent } from './customer-detail.component';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    MatIconModule,
    InputComponent,
    ReactiveFormsModule,
    MatAutocompleteModule,
    CommonModule,
    CustomerDetailComponent,
    MatChipsModule,
    FormsModule,
  ],
  template: `
    @if (appointment()) {
    <div class="customer-detail-container">
      <h2 class="customer-name">
        @if (appointment().id > 0) { {{ appointment().customer?.name }}
        {{ appointment().customer?.surname }}}@else { Nuovo Appuntamento }
      </h2>

      <form [formGroup]="appointmentForm">
        @if (appointment().id > 0) {
        <div class="customer-detail">
          <strong>Id:</strong> {{ appointment().id }}
        </div>
        }

        <div class="customer-detail">
          <strong>Cliente:</strong>
          <div class="customer-select-container">
            <input
              type="text"
              class="customer-autocomplete"
              [class]="
                customerId.invalid && customerId.touched ? 'invalid' : ''
              "
              placeholder="Cerca cliente"
              formControlName="customerSearch"
              [matAutocomplete]="auto"
            />
            <mat-autocomplete
              #auto="matAutocomplete"
              (optionSelected)="onCustomerSelected($event)"
            >
              @for (option of filteredCustomers | async; track option.id) {
              <mat-option
                [value]="option.name + ' ' + option.surname"
                [id]="option.id.toString()"
              >
                {{ option.name }} {{ option.surname }} -
                {{ option.phoneNumber }}
              </mat-option>
              }
            </mat-autocomplete>
            <button
              type="button"
              class="clear-customer-btn"
              *ngIf="customerId.value"
              (click)="clearCustomer()"
            >
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <mat-icon class="add" (click)="formInsertCustomer()">add</mat-icon>
        </div>

        <div class="customer-detail">
          <strong>Telefono:</strong>
          <span>{{ selectedCustomerPhone }}</span>
        </div>

        <div class="customer-detail">
          <strong>Data:</strong>
          <app-input
            [class]="
              dateControl.invalid && dateControl.touched ? 'invalid' : ''
            "
            [placeholder]="'Data'"
            [type]="'date'"
            formControlName="date"
          />
        </div>

        <div class="customer-detail">
          <strong>Ora:</strong>
          <app-input
            [class]="
              timeControl.invalid && timeControl.touched ? 'invalid' : ''
            "
            [placeholder]="'Ora'"
            [type]="'time'"
            formControlName="time"
          />
        </div>

        <div class="customer-detail">
          <strong>Durata:</strong>
          <app-input
            [class]="
              durationControl.invalid && durationControl.touched
                ? 'invalid'
                : ''
            "
            [placeholder]="'Durata (minuti)'"
            [type]="'number'"
            formControlName="duration"
          />
        </div>

        <div class="customer-detail">
          <strong>Note:</strong>
          <app-input
            [placeholder]="'Note'"
            [type]="'text'"
            formControlName="notes"
          />
        </div>

        <div class="customer-detail services-section">
          <strong>Servizi:</strong>
          <div class="services-container">
            @for (service of availableServices; track $index) {
              <div 
                class="service-chip" 
                [class.selected]="isServiceSelected(service)"
                (click)="toggleService(service)"
              >
                <div class="service-name">{{ service }}</div>
                <mat-icon *ngIf="isServiceSelected(service)" class="service-selected-icon">check_circle</mat-icon>
              </div>
            }            
          </div>
        </div>       

        <div class="buttons-container">
          <button class="close-button" type="button" (click)="close.emit()">
            Annulla
          </button>
          <button
            type="button"
            (click)="saveAppointment()"
            [disabled]="appointmentForm.invalid || selectedServices.length === 0"
            [class]="appointmentForm.invalid || selectedServices.length === 0 ? 'disabled' : 'update-button'"
          >
            @if(appointment().id > 0){ Salva Modifiche}@else { Inserisci
            Appuntamento }
          </button>
        </div>
      </form>
    </div>
    } @if (showCustomerDetail) {
    <app-customer-detail
      [customer]="customer"
      (close)="showCustomerDetail = false"
      (update)="updateCustomer($event)"
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

    .disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .invalid {
      border: 1px solid red;
      border-radius: 5px;
      padding: 0;
    }

    mat-icon {
      cursor: pointer;
      color: rgba(0, 0, 0, 0.51);
    }

    h2{
      font-weight: bold;
      color: brown;
      font-size: 2rem;
      text-align: center;
      margin-bottom: 50px;
    }

    .customer-detail-container {
      padding: 16px 24px;
      background-color: #f9f9f9;
      border-radius: 5px;
      box-shadow: 2px 6px 8px rgba(0, 0, 0, 0.5);
      width: fit-content;
      min-width: 600px;
      height: fit-content;
      max-height: 80vh;
      overflow-y: auto;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .customer-detail {
      margin: 40px 0;
      font-size: 1.25rem;
      color: #333;
      display: grid;
      grid-template-columns: 30% 65% 5%; 
      align-items: center;
    }
    button {
      color: white;
      border: none;
      border-radius: 5px;
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .close-button {
      background-color:rgba(0, 0, 0, 0.65);
    }
    .close-button:hover {
      background-color: rgba(0, 0, 0, 0.55);
    }

    .update-button {
      background-color:rgba(0, 56, 0, 0.75);
    }
    .update-button:hover {
      background-color: rgba(0, 54, 3, 0.65);
    }

    .customer-select-container {
      position: relative;
      width: 100%;
    }
    
    .customer-autocomplete {
      width: 100%;
      padding: 10px;
      font-size: 1rem;
      border: 1px solid #ccc;
      border-radius: 5px;
      box-sizing: border-box;
    }
    
    .clear-customer-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    
    .clear-customer-btn mat-icon {
      font-size: 18px;
      color: #888;
    }

    .services-section {
      display: block !important;
    }
    
    .services-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
      max-height: 200px;
      overflow-y: auto;
      padding: 5px;
      width: 100%;
      justify-content: center; /* Aggiunto per centrare i badge orizzontalmente */
    }
    
    .service-chip {
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 15px;
      transition: all 0.2s ease;
      position: relative;
      min-width: 120px;
    }
    
    .service-chip.selected {
      background-color: #e8f5e9;
      border-color: #81c784;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .service-name {
      font-weight: 500;
      margin-right: 10px;
    }
    
    .service-price {
      color: #666;
      font-weight: bold;
    }
    
    .service-selected-icon {
      color: #4caf50;
      font-size: 18px;
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: white;
      border-radius: 50%;
      height: 18px;
      width: 18px;
    }
    
    .no-services {
      color: #999;
      font-style: italic;
      padding: 10px;
      text-align: center;
      width: 100%;
    }
    
    .appointment-summary {
      background-color: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
      margin: 20px 0;
      padding: 15px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 1.1rem;
    }
    
    .total-price {
      color: #4caf50;
      font-weight: bold;
      font-size: 1.2rem;
    }
  `,
})
export class AppointmentDetailComponent {
  appointment = input.required<TableAppointment>();
  close = output<void>();
  update = output<Appointment>();
  customer = {} as Customer;
  // Form controls
  customerSearch = new FormControl('');
  customerId = new FormControl('', Validators.required);
  dateControl = new FormControl('', Validators.required);
  timeControl = new FormControl('', Validators.required);
  durationControl = new FormControl('', [
    Validators.required,
    Validators.min(1),
  ]);
  notesControl = new FormControl('');

  appointmentForm: FormGroup;
  showCustomerDetail: boolean = false;

  // For autocomplete
  availableCustomers: Customer[] = [];
  filteredCustomers!: Observable<Customer[]>;
  selectedCustomerPhone: string = '';

  // Servizi come semplici stringhe
  availableServices: string[] = [
    'Taglio', 'Piega', 'Colore', 'Trattamento', 'Manicure', 'Meches', 'Lisciante','',''
  ]; 
  
  selectedServices: string[] = [];

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.appointmentForm = this.fb.group({
      customerSearch: this.customerSearch,
      customerId: this.customerId,
      date: this.dateControl,
      time: this.timeControl,
      duration: this.durationControl,
      notes: this.notesControl,
    });

    // Monitora i cambiamenti nella lista clienti con effect
    effect(() => {
      // Quando cambia il segnale customers, aggiorna la lista disponibile
      this.availableCustomers = this.dataService.customers();
      // Riapplica il filtro corrente per aggiornare i risultati dell'autocomplete
      this.filteredCustomers = this.customerSearch.valueChanges.pipe(
        startWith(this.customerSearch.value),
        map((value) => this._filterCustomers(value || ''))
      );
    });
    
    // In un'implementazione reale, otterremmo i servizi dal backend
    // this.dataService.getServices().subscribe(services => {
    //   this.availableServices = services;
    // });
  }

  private _filterCustomers(value: string): Customer[] {
    const filterValue = value.toLowerCase();
    return this.availableCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(filterValue) ||
        customer.surname.toLowerCase().includes(filterValue) ||
        customer.phoneNumber?.toLowerCase().includes(filterValue)
    );
  }

  onCustomerSelected(event: any) {
    // Get the selected option element and extract the ID
    const optionId = event.option.id;
    if (optionId) {
      this.customerId.setValue(optionId);

      // Find the selected customer to show their phone number
      const selectedCustomer = this.availableCustomers.find(
        (c) => c.id.toString() === optionId
      );
      if (selectedCustomer) {
        this.selectedCustomerPhone = selectedCustomer.phoneNumber || '';
      }
    }
  }

  clearCustomer() {
    this.customerSearch.setValue('');
    this.customerId.setValue('');
    this.selectedCustomerPhone = '';
  }

  ngOnInit() {
    this.setControls();

    // Ensure we have the latest customer list
    if (this.availableCustomers.length === 0) {
      this.dataService.getAllData(DataType[DataType.CUSTOMER].toLowerCase());
    }
  }

  ngOnChanges() {
    this.setControls();
    this.availableCustomers = this.dataService.customers();
  }

  setControls() {
    const a = this.appointment();
    if (!a) return;

    // Gestione della data e ora
    let dateValue = '';
    let timeValue = '';

    if (a.date) {
      try {
        // Converti a Date se è una stringa
        const dateObj = typeof a.date === 'string' ? new Date(a.date) : a.date;

        if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
          // La data è valida
          dateValue = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
          timeValue = `${String(dateObj.getHours()).padStart(2, '0')}:${String(
            dateObj.getMinutes()
          ).padStart(2, '0')}`;
        }
      } catch (error) {
        console.error('Errore nel processare la data:', error);
      }
    }

    // Aggiorna il form
    this.appointmentForm.patchValue({
      customerId: a.customer?.id?.toString() || '',
      date: dateValue,
      time: timeValue,
      duration: a.duration || '',
      notes: a.notes || '',
    });

    // Aggiorna i campi del cliente selezionato
    if (a.customer) {
      this.customerSearch.setValue(
        `${a.customer.name || ''} ${a.customer.surname || ''}`.trim()
      );
      this.selectedCustomerPhone = a.customer.phoneNumber || '';
    } else {
      this.customerSearch.setValue('');
      this.selectedCustomerPhone = '';
    }

    // Aggiorna i servizi selezionati
    if (a.service && Array.isArray(a.service)) {
      this.selectedServices = [...a.service];
    } else {
      this.selectedServices = [];
    }
  }

  saveAppointment() {
    if (this.appointmentForm.invalid || this.selectedServices.length === 0) {
      return;
    }

    // Combine date and time
    const dateStr = this.dateControl.value || '';
    const timeStr = this.timeControl.value || '';
    let appointmentDateTime: Date | null = null;

    if (dateStr && timeStr) {
      appointmentDateTime = new Date(`${dateStr}T${timeStr}`);
    }

    const appointmentData: Appointment = {
      id: this.appointment()?.id || 0,
      date: appointmentDateTime!.toISOString() || new Date().toISOString(),
      customerId: parseInt(this.customerId.value || '0'),
      duration: parseInt(this.durationControl.value || '0'),
      service: this.selectedServices, 
      notes: this.notesControl.value || '',
    };
    console.log('Insert Appointment Data:', appointmentData);
    //this.update.emit(appointmentData);
  }

  formInsertCustomer() {
    this.showCustomerDetail = true;
    this.dataService.customer.set({} as Customer);
  }

  updateCustomer(customer: Customer) {
    if (!customer) return;
    
    if (!customer.id) {
      // Per un nuovo cliente, dobbiamo aspettare che il server restituisca l'ID
      this.dataService.insertData(
        DataType[DataType.CUSTOMER].toLowerCase(),
        customer
      );      
      // Aggiungiamo un timeout per dare tempo al server di rispondere e al signal di aggiornarsi
      setTimeout(() => {
        // Cerca il cliente appena inserito per nome e cognome
        const newCustomer = this.dataService.customers().find(
          c => c.name.toLowerCase() === customer.name.toLowerCase() && 
               c.surname.toLowerCase() === customer.surname.toLowerCase()
        );
        
        if (newCustomer) {
          this.customerId.setValue(newCustomer.id.toString());
          this.customerSearch.setValue(`${newCustomer.name} ${newCustomer.surname}`);
          this.selectedCustomerPhone = newCustomer.phoneNumber || '';
        }
      }, 500); // Aspetta 500ms per dare tempo al server di rispondere
      
    } else {
      // Aggiornamento di un cliente esistente
      this.dataService.updateData(
        DataType[DataType.CUSTOMER].toLowerCase(),
        customer.id,
        customer
      );
    }
    
    this.showCustomerDetail = false;
  }

  // Aggiungi questo metodo per selezionare automaticamente un cliente dopo l'inserimento
  selectCustomerById(customerId: number) {
    const selectedCustomer = this.availableCustomers.find(
      (c) => c.id === customerId
    );
    if (selectedCustomer) {
      this.customerId.setValue(selectedCustomer.id.toString());
      this.customerSearch.setValue(
        `${selectedCustomer.name} ${selectedCustomer.surname}`
      );
      this.selectedCustomerPhone = selectedCustomer.phoneNumber || '';
    }
  }

  // Metodi semplificati per la gestione dei servizi
  toggleService(service: string) {
    const index = this.selectedServices.indexOf(service);
    if (index > -1) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(service);
    }
  }

  isServiceSelected(service: string): boolean {
    return this.selectedServices.includes(service);
  }
}
