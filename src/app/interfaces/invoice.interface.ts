import { Customer } from './customer.interface';
import { User } from './user';

export interface Invoice {
  invoiceId: number;
  customerId: number;
  invoiceNumber: string;
  services: string;
  issuedAt: Date;
  dueAt: Date;
  status: string;
  total: number;
  totalVat: number;
  vatRate: number;
  isVatEnabled: boolean;
  invoiceLines: InvoiceLine[];
}

export interface InvoiceLine {
  invoiceLineId: number;
  description: string;
  type: typeInvoiceLine;
  duration: number;
  quantity: number;
  price: number;
  totalPrice: number;
}

export declare type typeInvoiceLine = 'SERVICE' | 'PRODUCT';

export interface InvoiceResponse {
  invoice: Invoice;
  user: User;
}

export interface EditInvoiceRequest {
  services: string;
  customerId: string;
  issuedAt: Date;
  status: string;
  total: number;
}

export interface ViewInvoice {
  invoice: Invoice;
  user: User;
  customer: Customer;
}

export declare type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Draft';
