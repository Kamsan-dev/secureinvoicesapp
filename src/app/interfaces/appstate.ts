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
   access_token: string;
   refresh_token: string;
}
