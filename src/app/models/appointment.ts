import { Time } from '@angular/common';
import { Customer } from './customer';

export interface Appointment {
  id: number;
  customerId: number;
  date: string;
  duration: number;
  services: string[];
  notes: string;
}

export interface TableAppointment {
  id: number;
  customer?: Customer;
  customerName?: string;
  date: string;
  duration: string;
  notes?: string;
  services?: string[];
}
