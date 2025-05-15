export interface Customer {
  id: number;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  firstAccess: Date;
  birthdate: Date;
}

export interface TableCustomer {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
}
