import { User } from './user';

export interface Invoice {
  invoiceId: number;
  invoiceNumber: string;
  services: string;
  issuedAt: Date;
  status: string;
  total: number;
}

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
