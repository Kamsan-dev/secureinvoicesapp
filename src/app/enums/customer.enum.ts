export type LabelValueFilter<T = string> = {
  label: string;
  value: T | string;
};

export enum CustomerTypeEnum {
  REGULAR = 'Regular',
  VIP = 'VIP',
  INDIVIDUAL = 'Individual',
  INSTITUTION = 'Institution',
}

export enum CustomerStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
  BANNED = 'Banned',
}
export const CUSTOMER_STATUS_ITEMS: LabelValueFilter<CustomerStatusEnum>[] = [
  { label: 'Active', value: CustomerStatusEnum.ACTIVE },
  { label: 'Inactive', value: CustomerStatusEnum.INACTIVE },
  { label: 'Pending', value: CustomerStatusEnum.PENDING },
  { label: 'Banned', value: CustomerStatusEnum.BANNED },
];

export const CUSTOMER_TYPE_ITEMS: LabelValueFilter<CustomerTypeEnum>[] = [
  { label: 'Regular', value: CustomerTypeEnum.REGULAR },
  { label: 'VIP', value: CustomerTypeEnum.VIP },
  { label: 'Individual', value: CustomerTypeEnum.INDIVIDUAL },
  { label: 'Institution', value: CustomerTypeEnum.INSTITUTION },
];
