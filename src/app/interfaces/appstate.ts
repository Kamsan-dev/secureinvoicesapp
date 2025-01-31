import { DataState } from '../enums/datastate.enum';
import { EventType } from '../enums/event-type.enum';
import { Customer } from './customer.interface';
import { Invoice } from './invoice.interface';
import { User } from './user';

export interface LoginState {
  dataState: DataState;
  loginSuccess?: boolean | undefined;
  error?: string | undefined;
  message?: string | undefined;
  isUsingMfa?: boolean | undefined;
}

export interface RegisterState {
  dataState: DataState;
  registerSuccess: boolean | undefined;
  error: string | undefined;
  message: string | undefined;
}

export interface ResetPasswordState {
  dataState: DataState;
  error: string | undefined;
  message: string | undefined;
}

export interface Profile {
  user: User;
  events: UserEvent[];
  roles: Role[];
  access_token: string;
  refresh_token: string;
}

export interface UserEvent {
  eventId: number;
  type: EventType;
  description: string;
  device: string;
  ipAddress: string;
  occuredAt: Date;
}

export interface Role {
  roleId: number;
  name: string;
  permission: string;
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface ResponsePageable<T> {
  content: T[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CustomersPage {
  page: ResponsePageable<Customer>;
  user: User;
  stats: Statistics;
}

export interface InvoicesPage {
  page: ResponsePageable<Invoice>;
  user: User;
}

export interface Statistics {
  totalBilled: number;
  totalCustomers: number;
  totalInvoices: number;
}

export interface VerifyState {
  dataState: DataState;
  verifySuccess: boolean | undefined;
  error?: string | undefined;
  title?: string;
  type?: AccountType;
  message?: string | undefined;
}

export type AccountType = 'account' | 'password';
