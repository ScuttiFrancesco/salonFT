import { Component, computed, OnInit, effect } from '@angular/core';
import { TableComponent } from './table.component';
import { DataService } from '../services/data.service';
import { log } from 'console';
import { interval } from 'rxjs';
import { Customer, TableCustomer } from '../models/customer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { API_URL, CustomerSearchDirection, CustomerSearchType, DataType } from '../models/constants';
import { debounceTime } from 'rxjs/operators';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { InputComponent } from './input.component';
import { CustomerDetailComponent } from './customer-detail.component';
import { AlertModalComponent } from './alert-modal.component';
import { ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
    CustomerDetailComponent,
    AlertModalComponent,
  ],
  template: `
    @defer (when righe.length > 0;) {
    <div [style.opacity]="opacity">
    <div class="title">Lista Clienti</div>

    <div class="search-container">
      <app-input [placeholder]="'Cerca per nominativo'" [type]="'text'" [formControl]="nameInput"/>
      <app-input [placeholder]="'Cerca per email'" [type]="'email'" [formControl]="emailInput"/>
      <app-input [placeholder]="'Cerca per telefono'" [type]="'text'" [formControl]="phoneInput"/>
      <mat-icon class="add" (click)="formInsertCustomer()">add</mat-icon>
    </div>
    <app-table
    [icons]="['delete','info']"
      [colonne]="colonne"
      [righe]="righe"
      [pageSize]="pagSize"
      (info)="infoCustomer($event)"
      (delete)="delete($event)"
    ></app-table></div>
    } @placeholder {
    <div class="loader-container">
      <mat-progress-spinner
        mode="indeterminate"
        [diameter]="32"
      ></mat-progress-spinner>
      <div class="loading">Caricamento...</div>
    </div>
    } @if (showCustomerDetail) {
    <app-customer-detail
      [customer]="customer()"
      (close)="showCustomerDetail = false ; opacity = 1"
      (update)="updateCustomer($event)"
      (delete)="delete($event)"
    />
    } @if(showAlertModal){
    <app-alert-modal
      [title]="'Elimina Cliente'"
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
export class CustomerListComponent implements OnInit {
  customers = computed(() => this.dataService.customers());
  customer = computed(() => this.dataService.customer());
  colonne: string[] = ['Id', 'Nome', 'Cognome', 'Email', 'Telefono'];
  nameInput = new FormControl('');
  emailInput = new FormControl('');
  phoneInput = new FormControl('');
  showCustomerDetail = false;
  showAlertModal = false;
  message: string = '';
  deletingCustomerId: number|null = null;
  opacity= 1;
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  pagSize = 5;

  constructor(private dataService: DataService, private http: HttpClient) {    
    effect(() => {
      const c = this.dataService.customer();
      if (this.deletingCustomerId != null && c.id === this.deletingCustomerId) {
        this.message = `Sei sicuro di voler eliminare il cliente ${c.name} ${c.surname}?`;
        this.showAlertModal = true;
        this.deletingCustomerId = null;
      }
    });
  }
  ngOnInit(): void {
   this.dataService.getAllDataPaginated(DataType.CUSTOMER, 1, this.pagSize, CustomerSearchType.NAME, CustomerSearchDirection.ASC);

    this.nameInput.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
      if (value) {
        this.emailInput.setValue('', { emitEvent: false });
        this.phoneInput.setValue('', { emitEvent: false });        
        if (this.tableComponent) {
          this.tableComponent.pageIndex = 0;
        }
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
        if (this.tableComponent) {
          this.tableComponent.pageIndex = 0;
        }
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
        if (this.tableComponent) {
          this.tableComponent.pageIndex = 0;
        }
      }
      this.dataService.getSearchedData(
        DataType[DataType.CUSTOMER].toLowerCase() + '/searchPhoneNumber',
        value ?? ''
      );
    });
  }

  get righe(): TableCustomer[] {
    const searchValue =
      this.nameInput.value?.trim() ||
      this.emailInput.value?.trim() ||
      this.phoneInput.value?.trim();
    const list =
      searchValue && searchValue.length > 0
        ? this.dataService.filtredCustomers()
        : this.customers();
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
      DataType[DataType.CUSTOMER].toLowerCase(),
      idCustomer
    );
    this.showCustomerDetail = true;
    this.opacity = 0.5;
  }

  updateCustomer(customer: Customer) {
    if (!customer) return;
    if (!customer.id) {
      this.dataService.insertData(
        DataType[DataType.CUSTOMER].toLowerCase(),
        customer
      );
    } else {
      this.dataService.updateData(
        DataType[DataType.CUSTOMER].toLowerCase(),
        customer.id,
        customer
      );
    }
    this.showCustomerDetail = false;
    this.opacity = 1;
  }

  formInsertCustomer() {
    this.showCustomerDetail = true;
    this.dataService.customer.set({} as Customer);
    this.opacity = 0.5;
    if (this.tableComponent) {
          this.tableComponent.pageIndex = 0;
        }
  }

  delete(idCustomer: number) {
    this.deletingCustomerId = idCustomer;
    this.dataService.getDataById(
      DataType[DataType.CUSTOMER].toLowerCase(),
      idCustomer
    );
    this.opacity = 0.5;
  }

  confirmDeleting(event: boolean) {
    if (event) {
      this.dataService.deleteData(
        DataType[DataType.CUSTOMER].toLowerCase(),
        this.customer().id
      );
    }
    this.showAlertModal = false;
    this.showCustomerDetail = false;
    this.opacity = 1;
  }
}
