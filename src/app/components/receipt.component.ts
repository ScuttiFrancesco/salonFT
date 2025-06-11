import { Component, input, output } from '@angular/core';
import { Receipt } from '../models/receipt';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { InputComponent } from './input.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  template: `
    @if (receipt().services) {
    <div class="customer-detail-container">
      <h2 class="customer-name">@if (receipt().id === 0) { Nuova }Ricevuta</h2>

      <form [formGroup]="receiptForm">
        <div class="customer-detail-list">
          @if (receipt().id > 0) {
          <div><strong>Id:</strong> {{ receipt().id }}</div>
          }
          <div>
            <strong>nominativo:</strong> {{ receipt().customerName }}
            {{ receipt().customerSurname }}
          </div>
          <div><strong>indirizzo:</strong> {{ receipt().customerAddress }}</div>
          <div>
            <strong>telefono:</strong> {{ receipt().customerPhoneNumber }}
          </div>
          <div><strong>email:</strong> {{ receipt().customerEmail }}</div>
          @if(receipt().id !== 0){
          <div>
            <strong>data:</strong> {{ receipt().date | date : 'dd/MM/yyyy' }}
          </div>
          <div>
            <strong>totale:</strong> {{ receipt().total | number : '1.2-2' }} €
          </div>
          <div>
            <strong>metodo di pagamento:</strong> {{ receipt().paymentMethod }}
          </div>
          <div>
            <strong>servizi:</strong>
            {{
              receipt().services?.join(', ') || 'Nessun servizio selezionato'
            }}
          </div>
          <div><strong>note:</strong> {{ receipt().notes }}</div>

          }@else {
          <div class="total-input">
            <strong style="margin-right: 10px">totale:</strong>
            <input
              [class]="
                totalControl.invalid && totalControl.touched ? 'invalid' : ''
              "
              placeholder="Totale (€)"
              type="number"
              formControlName="total"
            />
            <mat-icon>euro</mat-icon>
            @if(totalControl.invalid && totalControl.touched){
            <div class="validation-error">
              Il totale è obbligatorio e deve essere maggiore di 0.
            </div>
            }
          </div>

          <div class="services-container">
            @for (service of availableServices; track $index) {
            <div
              class="service-chip"
              [class.selected]="isServiceSelected(service)"
              (click)="toggleService(service)"
            >
              <div class="service-name">{{ service }}</div>
              <mat-icon
                *ngIf="isServiceSelected(service)"
                class="service-selected-icon"
                >check_circle</mat-icon
              >
            </div>
            } @if (paymentMethodControl.hasError('paymentRequired') &&
            paymentMethodControl.touched) {
            <div class="validation-error">
              Almeno un metodo di pagamento deve essere selezionato
            </div>
            }
          </div>

          <div>
            <strong>servizi:</strong>
            {{ receipt().services }}
          </div>
          <div class="notes-input">
            <strong style="margin-right: 10px">note:</strong>
            <textarea placeholder="Note" formControlName="notes"></textarea>
          </div>
          }
        </div>

        <div class="buttons-container">
          <button class="close-button" type="button" (click)="close.emit()">
            Chiudi
          </button>
          @if(authService.isAdmin()){ @if(receipt().id === 0){
          <button
            type="button"
            (click)="saveReceipt()"
            [disabled]="receiptForm.invalid"
            [class]="receiptForm.invalid ? 'disabled' : 'update-button'"
          >
            Salva Modifiche</button
          >} @if(receipt().id > 0){
          <button
            class="delete-button"
            type="button"
            (click)="delete.emit(receipt().id)"
          >
            Elimina
          </button>
          }}
        </div>
      </form>
    </div>
    }
  `,
  styles: `

        .total-input {
            display: flex;    
                align-items: center;        
                flex-direction: row;
        }

        .notes-input {
            display: flex;
            align-items: flex-start;
            flex-direction: row;
            gap: 10px;
        }

    .customer-detail-list {
        display: flex;
        flex-direction: column;
        font-size: 1.25rem;
        justify-content: center;
        align-items: start;    
        margin: 20px 0;
        font-size: 1.25rem;
        color: #333;
        gap: 32px;
        }

     input {
            padding-right: 8px;          
            font-size: 1rem;
            border-radius: 5px;
            border: 1px solid #ccc;
            box-sizing: border-box;
        }

        input[type='number'] {height: 32px;  width: 128px;}
        
        textarea {
            padding: 8px;
            font-size: 1rem;
            border-radius: 5px;
            border: 1px solid #ccc;
            box-sizing: border-box;
            height: 64px;
            width: 512px;
            resize: vertical;
            word-wrap: break-word;
        }

        .add{
                font-size: 1.5rem;
                color:rgb(255, 255, 255);
                cursor: pointer;
                background-color: rgb(0, 145, 29);
                border-radius: 50px;
                padding: 5px;
                margin-left: 5px;
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

        .validation-error {
            color: red;
            font-size: 0.8rem;
            margin-top: 5px;
            grid-column: 2;
            padding-left: 10px;
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
            z-index: 1000;
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

    
    
    .services-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
     flex-direction: row;
      
     
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

    
    `,
})
export class ReceiptComponent {
  delete = output<number>();
  receipt = input.required<Receipt>();
  update = output<Receipt>();
  close = output();
  receiptForm: FormGroup;

  totalControl = new FormControl('', {
    validators: [Validators.required, Validators.min(0.01)],
  });

  notesControl = new FormControl('');
  paymentMethodControl = new FormControl<string[]>(
    [],
    [this.paymentMethodValidator()]
  ); // Aggiungi controllo per il metodo di pagamento

  constructor(private fb: FormBuilder, public authService: AuthService) {
    this.receiptForm = this.fb.group({
      total: this.totalControl,
      notes: this.notesControl,
      paymentMethod: this.paymentMethodControl, // Aggiungi al form group
    });
  }

  ngOnInit() {
    this.setControls();
  }

  ngOnChanges() {
    this.setControls();
  }

  setControls() {
    const r = this.receipt();
    if (!r) return;

    this.receiptForm.patchValue({
      total: r.total ? r.total.toString() : '',
      notes: r.notes || '',
    });

    // Aggiorna i metodi di pagamento selezionati
    if (r.paymentMethod) {
      this.selectedServices = [r.paymentMethod];
      this.paymentMethodControl.setValue([r.paymentMethod]);
    } else {
      this.selectedServices = [];
      this.paymentMethodControl.setValue([]);
    }
  }

  saveReceipt() {
    this.paymentMethodControl.setValue([...this.selectedServices]);
    this.paymentMethodControl.markAsTouched();

    if (this.receiptForm.invalid) {
      console.log('Form is invalid:', this.receiptForm.errors);
      console.log(
        'Payment method control errors:',
        this.paymentMethodControl.errors
      );
      return;
    }

    const totalValue = parseFloat(
      this.totalControl.value?.toString().replace(',', '.') || '0'
    );

    const receiptData: Receipt = {
      ...this.receipt(),
      id: this.receipt().id || 0,
      appointmentId: this.receipt().appointmentId,
      appointmentDate: this.receipt().date,
      date: new Date().toISOString(),
      total: totalValue,
      paymentMethod: this.selectedServices[0] || 'Contanti', // Usa il primo metodo selezionato
      notes: this.notesControl.value || '',
    };

    this.update.emit(receiptData);
  }

  isServiceSelected(service: string): boolean {
    return this.selectedServices.includes(service);
  }

  availableServices: string[] = [
    'Bancomat',
    'Carta di Credito',
    'Contanti',
    'Assegno',
  ];

  selectedServices: string[] = [];

  toggleService(service: string) {
    // Per i metodi di pagamento, permetti solo una selezione
    if (this.selectedServices.includes(service)) {
      this.selectedServices = [];
    } else {
      this.selectedServices = [service]; // Solo un metodo alla volta
    }

    // Aggiorna il form control quando cambia la selezione
    this.paymentMethodControl.setValue([...this.selectedServices]);
    this.paymentMethodControl.markAsTouched();
  }

  // Validator personalizzato per i metodi di pagamento
  paymentMethodValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const paymentMethods = control.value;

      if (
        !paymentMethods ||
        !Array.isArray(paymentMethods) ||
        paymentMethods.length === 0
      ) {
        return {
          paymentRequired: {
            message: 'Almeno un metodo di pagamento deve essere selezionato',
          },
        };
      }

      return null;
    };
  }
}
