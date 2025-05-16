import { Component, computed, OnInit } from '@angular/core';
import { TableComponent } from './table.component';
import { DataService } from '../services/data.service';
import { log } from 'console';
import { interval } from 'rxjs';
import { Customer, TableCustomer } from '../models/customer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DataType } from '../models/constants';
import { debounceTime } from 'rxjs/operators';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { InputComponent } from './input.component';
import { CustomerDetailComponent } from "./customer-detail.component";

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    TableComponent,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    InputComponent,
    CustomerDetailComponent
],
  template: `
    @defer (when righe.length > 0;) {
    <div class="title">Lista Clienti</div>
    <div class="search-container">
      <app-input
        [placeholder]="'Nome o Cognome'"
        [input]="nameInput"
        [messaggio]="'Cerca per nome o cognome'"
      />
      <app-input
        [placeholder]="'Email'"
        [input]="emailInput"
        [messaggio]="'Cerca per email'"
      />
      <app-input
        [placeholder]="'Telefono'"
        [input]="phoneInput"
        [messaggio]="'Cerca per telefono'"
      />
    </div>
    <app-table [colonne]="colonne" [righe]="righe" (info)="infoCustomer($event)"></app-table>
    } @placeholder {
    <div class="loader-container">
      <mat-progress-spinner
        mode="indeterminate"
        [diameter]="32"
      ></mat-progress-spinner>
      <div class="loading">Loading...</div>
    </div>
    }
    @if (showCustomerDetail) {
    <app-customer-detail
    [customer]="customer()"
    (close)="showCustomerDetail = false"
    (update)="updateCustomer($event)"
    />}
  `,
  styles: `
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
text-align: center;
color: rgb(75, 75, 75);;
}
.search-container {
display: flex;
justify-content: space-around;
align-items: center;
flex-direction: row;
margin: 20px;

}
.input-container {
  display: flex; 
  flex-direction: column;
}
input {
  border-radius: 5px;
}
  `,
})
export class CustomerListComponent implements OnInit {
  customers = computed(() => this.dataService.customers());
  customer = computed(() => this.dataService.customer());
  colonne: string[] = ['Id','Nome', 'Cognome', 'Email', 'Telefono'];
  nameInput = new FormControl('');
  emailInput = new FormControl('');
  phoneInput = new FormControl('');
  showCustomerDetail = false;
  

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.nameInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (value) {
        this.emailInput.setValue('', { emitEvent: false });
        this.phoneInput.setValue('', { emitEvent: false });
      }
      this.dataService.getSearchedData(
        DataType[DataType.CUSTOMER].toLowerCase() + '/searchName',
        value ?? ''
      );
    });
    this.emailInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (value) {
        this.nameInput.setValue('', { emitEvent: false });
        this.phoneInput.setValue('', { emitEvent: false });
      }
      this.dataService.getSearchedData(
        DataType[DataType.CUSTOMER].toLowerCase() + '/searchEmail',
        value ?? ''
      );
    });
    this.phoneInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (value) {
        this.nameInput.setValue('', { emitEvent: false });
        this.emailInput.setValue('', { emitEvent: false });
      }
      this.dataService.getSearchedData(
        DataType[DataType.CUSTOMER].toLowerCase() + '/searchPhoneNumber',
        value ?? ''
      );
    });
   
  }

  get righe(): TableCustomer[] {
    const searchValue = this.nameInput.value?.trim() || this.emailInput.value?.trim() || this.phoneInput.value?.trim();
    const list =
      searchValue && searchValue.length > 0
        ? this.dataService.filtredCustomers()
        : this.dataService.customers();
    if (!list || !Array.isArray(list) || list.length === 0) return [];
    return list.map((customer) => ({
      id: customer.id, 
      name: customer.name,
      surname: customer.surname,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
    }));
  }

  infoCustomer(idCustomer: number) {
    this.dataService.getDataById(
      DataType[DataType.CUSTOMER].toLowerCase(),idCustomer
    );
    this.showCustomerDetail = true;
  }

  updateCustomer(customer: Customer) {
    
    this.showCustomerDetail = false;
  }
}
