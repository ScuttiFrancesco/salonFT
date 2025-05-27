import { Injectable, signal } from '@angular/core';
import { Customer } from '../models/customer';
import { HttpClient } from '@angular/common/http';
import { API_URL, DataType } from '../models/constants';
import { log } from 'console';
import { Appointment, TableAppointment } from '../models/appointment';
import { map } from 'rxjs';
import { PaginationInfo } from '../models/paginationInfo';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  customers = signal<Customer[]>([]);
  customer = signal<Customer>({} as Customer);
  customerPagination = signal<PaginationInfo>({} as PaginationInfo);
  appointmentPagination = signal<PaginationInfo>({} as PaginationInfo);
  
  appointments = signal<TableAppointment[]>([]);
  appointment = signal<TableAppointment>({} as TableAppointment);
  filtredAppointments = signal<TableAppointment[]>([]);
  messaggioErrore = signal<string>('');
  messaggioSuccesso = signal<string>('');
  pagSize = 10;

  constructor(private http: HttpClient) {}

  getAllDataPaginated(
    endpoint: string,
    type: number,
    page: number,
    size: number,
    sortBy: number,
    sortDir: number
  ) {
    this.http
      .get<any>(
        `${API_URL}/${type}/${endpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
      )
      .pipe(
        map((response) => {
          if (type === DataType.CUSTOMER) {
            this.customers.set(response.data);
            this.customerPagination.set(response.pagination);
            console.log('Customers fetched successfully:', response);
          }
          if (type === DataType.APPOINTMENT) {
            this.appointments.set([]);
            this.appointmentPagination.set(response.pagination);
            response.data.forEach((appointment: Appointment) => {
              this.http
                .get<Customer>(`${API_URL}/0/${appointment.customerId}`)
                .subscribe({
                  next: (customer) => {
                    const tableAppointment: TableAppointment = {
                      id: appointment.id,
                      date: appointment.date,
                      duration: appointment.duration.toString(),
                      services: appointment.services,
                      notes: appointment.notes,
                      customer: customer,
                    };

                    this.appointments.set([
                      ...this.appointments(),
                      tableAppointment,
                    ]);
                  },
                  error: (error) => {
                    this.messaggioErrore.set(error.error.message);
                    console.error(
                      'Error fetching customer for appointment:',
                      error
                    );
                  },
                });
            });           
          }
        })
      )
      .subscribe();
  }

  getAllData(type: string, searchTerm: string = 'retrieveAll') {
    this.http.get<any>(`${API_URL}/${type}/${searchTerm}`).subscribe({
      next: (response) => {
        if (type === DataType[DataType.CUSTOMER].toLowerCase()) {
          this.customers.set(response);

          console.log('Customers fetched successfully:', this.customers());
        }
        if (type === DataType[DataType.APPOINTMENT].toLowerCase()) {
          this.appointments.set([]);

          response.forEach((appointment: Appointment) => {
            this.http
              .get<Customer>(`${API_URL}/customer/${appointment.customerId}`)
              .subscribe({
                next: (customer) => {
                  const tableAppointment: TableAppointment = {
                    id: appointment.id,
                    date: appointment.date,
                    duration: appointment.duration.toString(),
                    services: appointment.services,
                    notes: appointment.notes,
                    customer: customer,
                  };

                  this.appointments.set([
                    ...this.appointments(),
                    tableAppointment,
                  ]);
                },
                error: (error) => {
                  this.messaggioErrore.set(error.error.message);
                  console.error(
                    'Error fetching customer for appointment:',
                    error
                  );
                },
              });
          });
          console.log(
            'Appointments fetched successfully:',
            this.appointments()
          );
        }
      },
      error: (error) => {
        this.messaggioErrore.set(error.error.message);
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
        if (type === DataType[DataType.APPOINTMENT].toLowerCase()) {
          this.http
            .get<Customer>(`${API_URL}/customer/${response.customerId}`)
            .subscribe({
              next: (customer) => {
                const tableAppointment: TableAppointment = {
                  id: response.id,
                  date: response.date,
                  duration: response.duration.toString(),
                  services: response.services,
                  notes: response.notes,
                  customer: customer,
                };
                this.appointment.set(tableAppointment);
              },
              error: (error) => {
                this.messaggioErrore.set(error.error.message);
                console.error(
                  'Error fetching customer for appointment:',
                  error
                );
              },
            });
        }

        console.log('Appointment caricato successfully:', this.appointment());
      },
      error: (error) => {
        this.messaggioErrore.set(error.error.message);
        console.error('Error fetching customers:', error);
      },
    });
  }

  updateData(type: string, id: number, data: any) {
    this.http.put<any>(`${API_URL}/${type}/${id}`, data).subscribe({
      next: (response) => {
        if (type === DataType[DataType.CUSTOMER].toLowerCase()) {
          this.customers.set(
            this.customers().map((customer) =>
              customer.id === id ? { ...customer, ...data } : customer
            )
          );
          this.messaggioSuccesso.set('Cliente aggiornato con successo');
          console.log('Customer updated successfully:', response);
        }
        if (type === DataType[DataType.APPOINTMENT].toLowerCase()) {
          this.http
            .get<Customer>(`${API_URL}/customer/${response.customerId}`)
            .subscribe({
              next: (customer) => {
                const tableAppointment: TableAppointment = {
                  id: response.id,
                  date: response.date,
                  duration: response.duration.toString(),
                  services: response.services,
                  notes: response.notes,
                  customer: customer,
                };
                this.appointments.set(
                  this.appointments().map((appointment) =>
                    appointment.id === id ? tableAppointment : appointment
                  )
                );
              },
              error: (error) => {
                this.messaggioErrore.set(error.error.message);
                console.error(
                  'Error fetching customer for appointment:',
                  error
                );
              },
            });

          this.messaggioSuccesso.set('Appuntamento aggiornato con successo');
          console.log('Appointment updated successfully:', response);
        }
      },
      error: (error) => {
        this.messaggioErrore.set(error.error.message);
        console.error('Error updating customer:', error);
      },
    });
  }

  insertData(type: string, data: any) {
    this.http.post<any>(`${API_URL}/${type}`, data).subscribe({
      next: (response) => {
        if (type === DataType[DataType.CUSTOMER].toLowerCase()) {
          this.customers.set([...this.customers(), response]);
          this.messaggioSuccesso.set('Cliente inserito con successo');
          console.log('Customer inserted successfully:', response);
        }
        if (type === DataType[DataType.APPOINTMENT].toLowerCase()) {
          console.log('Appointment inserted:', response);
          this.http
            .get<Customer>(`${API_URL}/customer/${response.customerId}`)
            .subscribe({
              next: (customer) => {
                const tableAppointment: TableAppointment = {
                  id: response.id,
                  date: response.date,
                  duration: response.duration.toString(),
                  services: response.services,
                  notes: response.notes,
                  customer: customer,
                };
                this.appointments.set([
                  ...this.appointments(),
                  tableAppointment,
                ]);
              },
              error: (error) => {
                this.messaggioErrore.set(error.error.message);
                console.error(
                  'Error fetching customer for appointment:',
                  error
                );
              },
            });

          this.messaggioSuccesso.set('Appuntamento inserito con successo');
          console.log('Appointment inserted successfully:', response);
        }
      },
      error: (error) => {
        this.messaggioErrore.set(error.error.message);
        console.error('Error inserting customer:', error.error.message);
      },
    });
  }

  deleteData(type: string, id: number) {
    this.http.delete<any>(`${API_URL}/${type}/${id}`).subscribe({
      next: (response) => {
        if (type === DataType[DataType.CUSTOMER].toLowerCase()) {
          this.customers.set(
            this.customers().filter((customer) => customer.id !== id)
          );
          this.messaggioSuccesso.set('Cliente eliminato con successo');
          console.log('Customer deleted successfully:', response);
        }
        if (type === DataType[DataType.APPOINTMENT].toLowerCase()) {
          this.appointments.set(
            this.appointments().filter((appointment) => appointment.id !== id)
          );
          this.messaggioSuccesso.set('Appuntamento eliminato con successo');
          console.log('Appointment deleted successfully:', response);
        }
      },
      error: (error) => {
        this.messaggioErrore.set(error.error.message);
        console.error('Error deleting customer:', error);
      },
    });
  }
}
