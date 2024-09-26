import { DataState } from '../enums/datastate.enum';
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
  user: User | undefined;
  events: UserEvent[] | undefined;
  roles: Role[] | undefined;
  access_token: string;
  refresh_token: string;
}

export interface UserEvent {
  id: number;
  type: EventType;
  description: string;
  device: string;
  ipAddress: string;
  createdAt: Date;
}

export interface Role {
  id: number;
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
