import { Customer } from './customer';

export interface Receipt {
  id: number;
  customer?: Customer;
  customerNameAndPhone?: string;
  customerId?: number;
  customerName?: string;
  customerSurname?: string;
  customerAddress?: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  appointmentId?: number;
  appointmentDate?: string;
  date: string;
  total: number;
  paymentMethod?: string;
  notes?: string;
  services?: string[];
}
