import { Time } from '@angular/common';
import { Customer } from './customer';

export interface Appointment {
  id: number;
  customerId: number;
  date: string;
  duration: number;
  services: string[];
  notes: string;
  customerNameAndPhone?: string;
}

export interface TableAppointment {
  id: number;
  customer?: Customer;
   customerNameAndPhone?: string;
   customerId?: number;
  date: string;
  duration: string;
  notes?: string;
  services?: string[];
}
