import { Injectable, signal } from '@angular/core';
import { Customer } from '../models/customer';
import { HttpClient } from '@angular/common/http';
import { API_URL, DataType } from '../models/constants';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  customers = signal<Customer[]>([]);

  constructor(private http: HttpClient) {
    this.getCustomers(DataType[DataType.CUSTOMER].toLowerCase());
  }

  getCustomers(type: string) {
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
}
