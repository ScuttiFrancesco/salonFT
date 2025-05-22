import { Component, input, output } from '@angular/core';
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
import { first } from 'rxjs';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [DatePipe, MatIconModule, InputComponent, ReactiveFormsModule],
  template: `
    @if (customer()) {
    <div class="customer-detail-container">
      
      <h2 class="customer-name">@if (customer().id > 0) {
        {{ customer().name }} {{ customer().surname }}}@else { Nuovo Cliente }
      </h2>

      <form [formGroup]="customerForm">
        @if (customer().id > 0) {
        <div class="customer-detail">
          <strong>Id:</strong> {{ customer().id }}
        </div>
        }

        <div class="customer-detail">
          <strong>Nome:</strong>
          <app-input
            [class]="
              nameControl.invalid && (nameControl.touched || nameControl.dirty) ? 'invalid' : ''
            "
            [placeholder]="'Nome'"
            [type]="'text'"
            formControlName="name"
          />
        </div>
        <div class="customer-detail">
          <strong>Cognome:</strong>
          <app-input
            [class]="
              surnameControl.invalid && (surnameControl.touched || surnameControl.dirty) ? 'invalid' : ''
            "
            [placeholder]="'Cognome'"
            [type]="'text'"
            formControlName="surname"
          />
        </div>

        <div class="customer-detail">
          <strong>Email:</strong>
          <app-input
            [class]="
              emailControl.invalid && (emailControl.touched || emailControl.dirty) ? 'invalid' : ''
            "
            [placeholder]="'Email'"
            [type]="'email'"
            formControlName="email"
          />
        </div>
        <div class="customer-detail">
          <strong>Telefono:</strong>
          <app-input
            [class]="
              phoneNumberControl.invalid && (phoneNumberControl.touched || phoneNumberControl.dirty)
                ? 'invalid'
                : ''
            "
            [placeholder]="'Telefono'"
            [type]="'text'"
            formControlName="phoneNumber"
          />
        </div>
        <div class="customer-detail">
          <strong>Data di nascita:</strong>
          <app-input
            [class]="
              birthdateControl.invalid && (birthdateControl.touched || birthdateControl.dirty)
                ? 'invalid'
                : ''
            "
            [placeholder]="'Data di nascita'"
            [type]="'date'"
            formControlName="birthdate"
          />
        </div>
        <div class="customer-detail">
          <strong>Indirizzo:</strong>
          <app-input
            [class]="
              addressControl.invalid && addressControl.touched ? 'invalid' : ''
            "
            [placeholder]="'Indirizzo'"
            [type]="'text'"
            formControlName="address"
          />
        </div>
        @if (customer().id > 0) {
        <div class="customer-detail">
          <strong>Primo accesso:</strong>
          {{ customer().firstAccess | date : 'HH:mm - dd/MM/yyyy' }}
        </div>
        }
        <div class="buttons-container">
          <button class="close-button" type="button" (click)="close.emit()">
            Annulla
          </button>
          <button
            type="button"
            (click)="updateCustomer()"
            [disabled]="customerForm.invalid"
            [class]="customerForm.invalid ? 'disabled' : 'update-button'"
          >
            @if(customer().id > 0){ Salva Modifiche}@else { Inserisci Cliente }
          </button>
        </div>
      </form>
    </div>
    }
  `,
  styles: `

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
  `,
})
export class CustomerDetailComponent {
  customer = input.required<Customer>();
  close = output<void>();
  update = output<Customer>();
  nameControl = new FormControl('', Validators.required);
  surnameControl = new FormControl('', Validators.required);
  emailControl = new FormControl('', Validators.required);
  phoneNumberControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\+?\d{8,15}$/),
  ]);
  birthdateControl = new FormControl('', Validators.required);
  addressControl = new FormControl('', Validators.required);

  customerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.customerForm = this.fb.group({
      name: this.nameControl,
      surname: this.surnameControl,
      email: this.emailControl,
      phoneNumber: this.phoneNumberControl,
      birthdate: this.birthdateControl,
      address: this.addressControl,
    });
  }

  ngOnInit() {
    this.setControls();
  }

  ngOnChanges() {
    this.setControls();
  }

  setControls() {
    const c = this.customer();
    this.customerForm.patchValue({
      name: c.name ?? '',
      surname: c.surname ?? '',
      email: c.email ?? '',
      phoneNumber: c.phoneNumber ?? '',
      birthdate: c.birthdate
        ? typeof c.birthdate === 'string'
          ? c.birthdate
          : c.birthdate.toISOString().slice(0, 10)
        : '',
      address: c.address ?? '',
      firstAccess: c.firstAccess
    });
  }

  updateCustomer() {
    this.update.emit({
      ...this.customer(),
      name: this.customerForm.value.name ?? '',
      surname: this.customerForm.value.surname ?? '',
      email: this.customerForm.value.email ?? '',
      phoneNumber: this.customerForm.value.phoneNumber ?? '',
      birthdate: this.customerForm.value.birthdate
        ? new Date(this.customerForm.value.birthdate)
        : this.customer().birthdate,
      address: this.customerForm.value.address ?? '',
      firstAccess: this.customer().firstAccess ? this.customer().firstAccess: new Date()
    });
  }

  
}
