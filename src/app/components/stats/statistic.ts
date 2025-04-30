export interface MonthlyInvoiceStatistic {
  month: string;
  status: string;
  invoiceCount: number;
}
export interface MonthlyInvoiceStatistics {
  stats: MonthlyInvoiceStatistic[];
}

export interface InvoicesByStatus {
  stats: {
    count: number;
    status: string;
  }[];
}
export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

export const chartsColorMap = new Map<InvoiceStatus, string>();
chartsColorMap.set('Paid', 'rgb(34, 197, 94, 0.7)');
chartsColorMap.set('Pending', 'rgba(255, 159, 10)');
chartsColorMap.set('Overdue', 'rgb(239, 68, 68, 0.7)');
chartsColorMap.set('Draft', 'gray');

export function getStatusColor(status: any): string {
  return chartsColorMap.get(status) || 'rgba(150, 150, 150, 0.6)';
}
