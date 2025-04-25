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
chartsColorMap.set('Paid', '#4CAF50');
chartsColorMap.set('Pending', '#FFC107');
chartsColorMap.set('Overdue', '#F44336');

export function getStatusColor(status: any): string {
  return chartsColorMap.get(status) || 'rgba(150, 150, 150, 0.6)';
}
