export interface Invoice {
  invoiceId: number;
  invoiceNumber: string;
  services: string;
  issuedAt: Date;
  status: string;
  total: number;
}
