import { Component, input, output } from '@angular/core';
import { Customer } from '../models/customer';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { InputComponent } from './input.component';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [DatePipe, MatIconModule, InputComponent, ReactiveFormsModule],
  template: `
  @if (customer()) {
    <div class="customer-detail-container">
      <h2 class="customer-name">
        {{ customer().name }} {{ customer().surname }}
      </h2>
      <form>
        <div class="customer-detail">
          <strong>Id:</strong> {{ customer().id }}
        </div>
        <div class="customer-detail">
          <strong>Email:</strong>
          <app-input
            [placeholder]="'Email'"
            [input]="emailControl"
            
          />
        </div>
        <div class="customer-detail">
          <strong>Telefono:</strong>
          <app-input
            [placeholder]="'Telefono'"
            [input]="phoneControl"
            
          />
        </div>
        <div class="customer-detail">
          <strong>Data di nascita:</strong>
          <app-input
            [placeholder]="'Data di nascita'"
            [input]="birthdateControl"
            
          />
        </div>
        <div class="customer-detail">
          <strong>Indirizzo:</strong>
          <app-input
            [placeholder]="'Indirizzo'"
            [input]="addressControl"
           
          />
        </div>
        <div class="customer-detail">
          <strong>Primo accesso:</strong>
          {{ customer().firstAccess | date : 'HH:ss - dd/MM/yyyy' }}
        </div>
        <div class="buttons-container">
          <button class="close-button" type="button" (click)="close.emit()">Annulla</button>
          <button class="update-button" type="button" (click)="updateCustomer()">Salva Modifiche</button>
        </div>
      </form>
    </div>}
  `,
  styles: `

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
  `,
})
export class CustomerDetailComponent {
  customer = input.required<Customer>();
  close = output<void>();
  update = output<Customer>();

  emailControl = new FormControl('', Validators.required);
  phoneControl = new FormControl('', Validators.required);
  birthdateControl = new FormControl('', Validators.required);
  addressControl = new FormControl('', Validators.required);

  ngOnInit() {
    this.setControls();
  }

  ngOnChanges() {
    this.setControls();
  }

  setControls() {
    const c = this.customer();
    this.emailControl.setValue(c.email ?? '');
    this.phoneControl.setValue(c.phoneNumber ?? '');
    this.birthdateControl.setValue(
      c.birthdate ? (typeof c.birthdate === 'string' ? c.birthdate : c.birthdate.toISOString().slice(0, 10)) : ''
    );
    this.addressControl.setValue(c.address ?? '');
  }

  updateCustomer() {
   this.update.emit({
    ...this.customer(),
     email: this.emailControl.value ?? '',
   phoneNumber: this.phoneControl.value ?? '',
    birthdate: this.birthdateControl.value ? new Date(this.birthdateControl.value) : this.customer().birthdate,
     address: this.addressControl.value ?? ''
  });
   }
}
