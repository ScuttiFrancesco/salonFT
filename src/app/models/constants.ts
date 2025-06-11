import e from 'express';

export const API_URL = 'http://localhost:8080/api';
export const AUTH_URL = 'http://localhost:8080/auth';

export enum DataType {
  CUSTOMER = 0,
  APPOINTMENT = 1,
  RECEIPT = 2, // Aggiungi se non presente
}

export enum CustomerSearchType {
  ID = 0,
  NAME = 1,
  SURNAME = 2,
  EMAIL = 3,
  PHONE_NUMBER = 4,
}

export enum CustomerSearchDirection {
  ASC = 0,
  DESC = 1,
}

export enum AppointmentSearchType {
  ID = 0,
  DATE = 1,
  CUSTOMER_NAME = 2,
  OPERATOR_NAME = 3,
  DURATION = 4,
}

export enum ReceiptSearchType {
  ID = 0,
  DATE = 1,
  CUSTOMER_NAME = 2,
  OPERATOR_NAME = 3,
  TOTAL_AMOUNT = 4,
  NOTES = 5,
  PAYMENT_METHOD = 6,
}

export const CUSTOM_NATIVE_DATE_FORMATS = {
  parse: {
    dateInput: { day: 'numeric', month: 'numeric', year: 'numeric' }, // Permette l'input come gg/mm/aaaa
  },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' }, // Visualizza come DD/MM/YYYY nell'input
    monthYearLabel: { month: 'long', year: 'numeric' }, // Usa 'long' per il nome completo del mese
    dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' }, // Per accessibilità
    monthYearA11yLabel: { month: 'long', year: 'numeric' }, // Per accessibilità
  },
};