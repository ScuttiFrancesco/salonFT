import e from 'express';

export const API_URL = 'http://localhost:8080/api';

export enum DataType {
  CUSTOMER = 0,
  APPOINTMENT = 1,
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
