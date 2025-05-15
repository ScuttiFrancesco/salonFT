import { Component, computed } from '@angular/core';
import { TableComponent } from './table.component';
import { DataService } from '../services/data.service';
import { log } from 'console';
import { interval } from 'rxjs';
import { Customer, TableCustomer } from '../models/customer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [TableComponent, MatProgressSpinnerModule],
  template: `
    @defer (when righe.length > 0;) {
      <app-table [colonne]="colonne" [righe]="righe"></app-table>
    } @placeholder {    
      <div class="loader-container">
        <mat-progress-spinner mode="indeterminate" [diameter]="32"></mat-progress-spinner>
        <div class="loading">Loading...</div>
      </div> 
    }
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
  `,
})
export class CustomerListComponent {
  constructor(private dataService: DataService) {}
  customers = computed(() => this.dataService.customers());
  colonne: string[] = ['Nome', 'Cognome', 'Email', 'Telefono'];

  get righe(): TableCustomer[] {
    const list = this.customers();
    if (!list || !Array.isArray(list) || list.length === 0) return [];
    return list.map((customer) => ({
      name: customer.name,
      surname: customer.surname,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
    }));
  }
}
