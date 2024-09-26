import { DataState } from '../enums/datastate.enum';

export interface State<T> {
  dataState: DataState;
  appData: T | undefined;
  error: string | undefined;
}
