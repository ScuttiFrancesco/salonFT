import { Component, input, output } from '@angular/core';
import { Customer } from '../models/customer';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="customer-detail-container">
      <h2 class="customer-name">
        {{ customer().name }} {{ customer().surname }}
      </h2>
      <div class="customer-detail">
        <strong>Id:</strong> {{ customer().id }}
      </div>
      <div class="customer-detail">
        <strong>Email:</strong> {{ customer().email }}
      </div>
      <div class="customer-detail">
        <strong>Telefono:</strong> {{ customer().phoneNumber }}
        <div>
          <div class="customer-detail">
            <strong>Data di nascita:</strong>
            {{ customer().birthdate | date : 'dd/MM/yyyy' }}
          </div>
          <div class="customer-detail">
            <strong>Data di primo accesso:</strong>
            {{ customer().firstAccess | date : 'dd/MM/yyyy' }}
          </div>
          <div class="customer-detail">
            <strong>Indirizzo:</strong>
            {{ customer().address }}
          </div>
        </div>
      </div>
      <button (click)="(close.emit)">Chiudi</button>
    </div>
  `,
  styles: `



  h2{
    font-weight: bold;
    color: brown;
    font-size: 2rem;
    text-align: center;
    margin-bottom: 50px;
  }

  .customer-detail-container {
    padding: 5px 20px;
    background-color: #f9f9f9;
    border-radius: 5px;
    box-shadow: 2px 6px 8px rgba(0, 0, 0, 0.5);
    width: 40vw;
    height: 70vh;
    position: absolute;
    top: 55%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .customer-detail {
    margin: 40px 0;
    font-size: 1.25rem;
    color: #333;

  }
  `,
})
export class CustomerDetailComponent {
  customer = input.required<Customer>();
  close = output<void>();
}
