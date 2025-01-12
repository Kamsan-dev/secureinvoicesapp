export interface MonthlyInvoiceStatistic {
  month: string;
  status: string;
  invoiceCount: number;
}
export interface MonthlyInvoiceStatistics {
  stats: MonthlyInvoiceStatistic[];
}
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

export const chartsColorMap = new Map<InvoiceStatus, string>();
chartsColorMap.set('Paid', '#2ed47a');
chartsColorMap.set('Pending', '#ffb946');
chartsColorMap.set('Overdue', '#f7685b');

export function getStatusColor(status: any): string {
  return chartsColorMap.get(status) || 'rgba(150, 150, 150, 0.6)';
}
