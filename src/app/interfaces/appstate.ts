import { DataState } from '../enums/datastate.enum';
import { Customer } from './customer.interface';
import { User } from './user';

export interface LoginState {
  dataState: DataState;
  loginSuccess: boolean | undefined;
  error: string | undefined;
  message: string | undefined;
  isUsingMfa: boolean | undefined;
  currentUser: User | undefined;
}

export interface Profile {
  user: User;
  events: UserEvent[];
  roles: Role[];
  access_token: string;
  refresh_token: string;
}

export interface UserEvent {
  eventId: number;
  type: EventType;
  description: string;
  device: string;
  ipAddress: string;
  occuredAt: Date;
}

export interface Role {
  roleId: number;
  name: string;
  permission: string;
}

export enum EventType {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_ATTEMPT_FAILURE = 'LOGIN_ATTEMPT_FAILURE',
  LOGIN_ATTEMPT_SUCCESS = 'LOGIN_ATTEMPT_SUCCESS',
  PROFIL_UPDATE = 'PROFIL_UPDATE',
  PROFIL_PICTURE_UPDATE = 'PROFIL_PICTURE_UPDATE',
  ROLE_UPDATE = 'ROLE_UPDATE',
  ACCOUNT_SETTINGS_UPDATE = 'ACCOUNT_SETTINGS_UPDATE',
  PASSWORD_UPDATE = 'PASSWORD_UPDATE',
  MFA_UPDATE = 'MFA_UPDATE',
}

export enum RoleEnum {
  ROLE_USER = 'ROLE_USER',
  ROLE_MANAGER = 'ROLE_MANAGER',
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_SYSADMIN = 'ROLE_SYSADMIN',
}

export interface Pageable {
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface CustomersResponse {
  content: Customer[];
  pageable: Pageable;
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
