import { Injectable, signal } from '@angular/core';
import { Customer } from '../models/customer';
import { HttpClient } from '@angular/common/http';
import { API_URL, DataType } from '../models/constants';
import { log } from 'console';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  customers = signal<Customer[]>([]);
  customer = signal<Customer>({} as Customer);
  filtredCustomers = signal<Customer[]>([]);

  constructor(private http: HttpClient) {
    this.getAllData(DataType[DataType.CUSTOMER].toLowerCase());
  }

  getAllData(type: string) {
    this.http.get<any>(`${API_URL}/${type}/retrieveAll`).subscribe({
      next: (response) => {
        if (type === DataType[DataType.CUSTOMER].toLowerCase()) {
          this.customers.set(response);
          console.log('Customers fetched successfully:', this.customers());
        }
      },
      error: (error) => {
        console.error('Error fetching customers:', error);
      },
    });
  }

  getDataById(type: string, id: number) {
    this.http.get<any>(`${API_URL}/${type}/${id}`).subscribe({
      next: (response) => {
        if (type === DataType[DataType.CUSTOMER].toLowerCase()) {
          this.customer.set(response);
          console.log('Customers fetched successfully:', this.customer());
        }
      },
      error: (error) => {
        console.error('Error fetching customers:', error);
      },
    });
  }

  getSearchedData(type: string, searchTerm: string) {
    this.http.get<any>(`${API_URL}/${type}=${searchTerm}`).subscribe({
      next: (response) => {
        if (type.includes(DataType[DataType.CUSTOMER].toLowerCase())) {
          this.filtredCustomers.set(response);
          console.log(
            'Filtred Customers fetched successfully:',
            this.filtredCustomers()
          );
        }
      },
      error: (error) => {
        console.error('Error fetching customers:', error);
      },
    });
  }
}
