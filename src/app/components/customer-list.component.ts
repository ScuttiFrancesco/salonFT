import { Component, computed, OnInit, effect, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { TableComponent } from './table.component';
import { DataService } from '../services/data.service';
import { log } from 'console';
import { interval } from 'rxjs';
import { Customer, TableCustomer } from '../models/customer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  API_URL,
  CustomerSearchDirection,
  CustomerSearchType,
  DataType,
} from '../models/constants';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { InputComponent } from './input.component';
import { CustomerDetailComponent } from './customer-detail.component';
import { AlertModalComponent } from './alert-modal.component';
import { ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import e from 'express';
import { PaginationComponent } from './pagination.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableComponent,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    InputComponent,
    CustomerDetailComponent,
    AlertModalComponent,
    PaginationComponent,
  ],
  template: `
    @defer (when righeComputed().length > 0;) {
    <div [style.opacity]="opacity">
      <div class="title">Lista Clienti</div>
      <div class="search-container">
        <app-input [placeholder]="'Cerca per nominativo'" [type]="'text'" [formControl]="nameInput" />
        <app-input [placeholder]="'Cerca per email'" [type]="'email'" [formControl]="emailInput" />
        <app-input [placeholder]="'Cerca per telefono'" [type]="'text'" [formControl]="phoneInput" />
        <mat-icon class="add" (click)="formInsertCustomer()">add</mat-icon>
      </div>
      
      <app-table 
        [icons]="['delete', 'info']" 
        [colonne]="colonne" 
        [righe]="righeComputed()"
        [trackByFn]="trackByCustomerId"
        (orderBy)="orderBy($event)"
        (info)="infoCustomer($event)" 
        (delete)="delete($event)">
                
        <app-pagination
          [currentPage]="customerPagination().currentPage"
          [totalPages]="customerPagination().totalPages"
          [currentPageSize]="pagSize"
          (nextPage)="nextPage()"
          (prevPage)="prevPage()"
          (firstPage)="initialData(getSearchEndpoint())"
          (lastPage)="lastPage()"
          (pageSize)="pageSize($event)">
        </app-pagination>
        
      </app-table>
    </div>
 } @placeholder {
 <div class="loader-container">
   <mat-progress-spinner mode="indeterminate" [diameter]="32"></mat-progress-spinner>
   <div class="loading">Caricamento...</div>
 </div>
 } @if (showCustomerDetail) {
 <app-customer-detail [customer]="customer()" (close)="showCustomerDetail = false; opacity = 1"
   (update)="updateCustomer($event)" (delete)="delete($event)" />
 } @if(showAlertModal){
 <app-alert-modal [title]="'Elimina Cliente'" [confirmation]="true" (confirm)="confirmDeleting($event)"
   [message]="message" />

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
export class CustomerListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  customers = computed(() => this.dataService.customers());
  customer = computed(() => this.dataService.customer());
  customerPagination = computed(() => this.dataService.customerPagination());
  
  // Computed ottimizzato per le righe
  righeComputed = computed(() => {
    const customers = this.customers();
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return [];
    }
    
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      surname: customer.surname,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
    }));
  });

  colonne: string[] = ['Id', 'Nome', 'Cognome', 'Email', 'Telefono'];
  nameInput = new FormControl('');
  emailInput = new FormControl('');
  phoneInput = new FormControl('');
  showCustomerDetail = false;
  showAlertModal = false;
  message: string = '';
  deletingCustomerId: number | null = null;
  opacity = 1;
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  pagSize = 5;

  // TrackBy function per ottimizzare le liste
  trackByCustomerId = (index: number, item: any) => item.id;

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
    this.initialData();

    // Debounce aumentato e gestione subscription
    this.nameInput.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        if (value) {
          this.emailInput.setValue('', { emitEvent: false });
          this.phoneInput.setValue('', { emitEvent: false });
        }
        this.initialData('searchByName=' + value);
      });

    this.emailInput.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        if (value) {
          this.nameInput.setValue('', { emitEvent: false });
          this.phoneInput.setValue('', { emitEvent: false });
        }
        this.initialData('searchByEmail=' + value);
      });

    this.phoneInput.valueChanges
      .pipe(
        debounceTime(1000),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        if (value) {
          this.nameInput.setValue('', { emitEvent: false });
          this.emailInput.setValue('', { emitEvent: false });
        }
        this.initialData('searchByPhoneNumber=' + value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initialData(value: string = '') {
    if (value !== '') {
      this.dataService.getAllDataPaginated(
        value,
        DataType.CUSTOMER,
        1,
        this.pagSize,
        CustomerSearchType.ID,
        CustomerSearchDirection.ASC
      );
    } else {
      this.dataService.getAllDataPaginated(
        'retrieveAll/paginated',
        DataType.CUSTOMER,
        1,
        this.pagSize,
        CustomerSearchType.ID,
        CustomerSearchDirection.ASC
      );
    }
  }

  get righe(): TableCustomer[] {
    // Deprecato - usa righeComputed() invece
    return this.righeComputed();
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

  nextPage() {
    let endpoint = 'retrieveAll/paginated';
    if (this.nameInput.value?.trim()) {
      endpoint = 'searchByName=' + this.nameInput.value?.trim();
    } else if (this.emailInput.value?.trim()) {
      endpoint = 'searchByEmail=' + this.emailInput.value?.trim();
    } else if (this.phoneInput.value?.trim()) {
      endpoint = 'searchByPhoneNumber=' + this.phoneInput.value?.trim();
    }

    this.dataService.getAllDataPaginated(
      endpoint,
      DataType.CUSTOMER,
      this.customerPagination().currentPage + 1,
      this.pagSize,
      this.customerPagination().sortBy,
      this.customerPagination().sortDirection
    );
  }

  prevPage() {
    let endpoint = 'retrieveAll/paginated';
    if (this.nameInput.value?.trim()) {
      endpoint = 'searchByName=' + this.nameInput.value?.trim();
    } else if (this.emailInput.value?.trim()) {
      endpoint = 'searchByEmail=' + this.emailInput.value?.trim();
    } else if (this.phoneInput.value?.trim()) {
      endpoint = 'searchByPhoneNumber=' + this.phoneInput.value?.trim();
    }
    this.dataService.getAllDataPaginated(
      endpoint,
      DataType.CUSTOMER,
      this.customerPagination().currentPage - 1,
      this.pagSize,
      this.customerPagination().sortBy,
      this.customerPagination().sortDirection
    );
  }

  orderBy(col: string) {
    let colIndex: number = 0;
    switch (col) {
      case 'Id':
        colIndex = 0;
        break;
      case 'Nome':
        colIndex = 1;
        break;
      case 'Cognome':
        colIndex = 2;
        break;
    }
    this.dataService.getAllDataPaginated(
      'retrieveAll/paginated',
      DataType.CUSTOMER,
      1,
      this.pagSize,
      colIndex,
      this.customerPagination().sortDirection === CustomerSearchDirection.ASC
        ? CustomerSearchDirection.DESC
        : CustomerSearchDirection.ASC
    );
  }

  pageSize(size: number) {
    this.emailInput.setValue('', { emitEvent: false });
    this.phoneInput.setValue('', { emitEvent: false });
    this.nameInput.setValue('', { emitEvent: false });

    this.pagSize = size;
    this.dataService.getAllDataPaginated(
      'retrieveAll/paginated',
      DataType.CUSTOMER,
      1,
      this.pagSize,
      this.customerPagination().sortBy,
      this.customerPagination().sortDirection
    );
  }

  lastPage(){
    let endpoint = 'retrieveAll/paginated';
    if (this.nameInput.value?.trim()) {
      endpoint = 'searchByName=' + this.nameInput.value?.trim();
    } else if (this.emailInput.value?.trim()) {
      endpoint = 'searchByEmail=' + this.emailInput.value?.trim();
    } else if (this.phoneInput.value?.trim()) {
      endpoint = 'searchByPhoneNumber=' + this.phoneInput.value?.trim();
    }
    this.dataService.getAllDataPaginated(
      endpoint,
      DataType.CUSTOMER,
      this.customerPagination().totalPages,
      this.pagSize,
      this.customerPagination().sortBy,
      this.customerPagination().sortDirection
    );
  }

  getSearchEndpoint(): string {
    if (this.nameInput.value?.trim()) {
      return 'searchByName=' + this.nameInput.value?.trim();
    } else if (this.emailInput.value?.trim()) {
      return 'searchByEmail=' + this.emailInput.value?.trim();
    } else if (this.phoneInput.value?.trim()) {
      return 'searchByPhoneNumber=' + this.phoneInput.value?.trim();
    }
    return 'retrieveAll/paginated';
  }
}
