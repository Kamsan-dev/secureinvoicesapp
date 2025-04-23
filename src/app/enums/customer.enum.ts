import { signal } from '@angular/core';

export enum CustomerType {
  REGULAR = 'Regular',
  VIP = 'VIP',
  INDIVIDUAL = 'Individual',
  INSTITUTION = 'Institution',
}

export enum CustomerStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
  BANNED = 'Banned',
}

export const CUSTOMER_TYPE_ITEMS = signal<string[]>(Object.values(CustomerType));
export const CUSTOMER_STATUS_ITEMS = signal<string[]>(Object.values(CustomerStatus));

export const CUSTOMER_STATUS_ITEMS_FILTERS = signal<{ label: string; value: CustomerStatus | string }[]>([
  { label: 'Status (All)', value: 'all' },
  { label: 'Active', value: CustomerStatus.ACTIVE },
  { label: 'Inactive', value: CustomerStatus.INACTIVE },
  { label: 'Pending', value: CustomerStatus.PENDING },
  { label: 'Banned', value: CustomerStatus.BANNED },
]);

export const CUSTOMER_TYPE_ITEMS_FILTERS = signal<{ label: string; value: CustomerType | string }[]>([
  { label: 'Type (All)', value: 'all' },
  { label: 'Regular', value: CustomerType.REGULAR },
  { label: 'VIP', value: CustomerType.VIP },
  { label: 'INDIVIDUAL', value: CustomerType.INDIVIDUAL },
  { label: 'INSTITUTION', value: CustomerType.INSTITUTION },
]);
