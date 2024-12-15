import { Invoice } from './invoice.interface';
import { User } from './user';

export interface Customer {
  customerId: number;
  name: string;
  email: string;
  type: string;
  status: string;
  address: string;
  phone: string;
  imageUrl: string;
  createdAt: Date;
  invoices: Invoice[] | undefined;
}

// edit customer interfaces
export interface EditCustomer {
  customer: Customer;
  user: User;
}
export interface EditCustomerRequest {
  name: string;
  email: string;
  imageUrl: string;
  phone: string;
  type: string;
  status: string;
  address: string;
}
