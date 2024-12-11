import { Invoice } from './invoice.interface';

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
