export interface CustomHttpResponse<T> {
   timeStamp: Date;
   statusCode: number;
   status: string;
   reason: string | undefined;
   message: string;
   developerMessage: string | undefined;
   data: T | undefined;
   path: string | undefined;
}
