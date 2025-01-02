import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

@Injectable()
export class HttpCacheService {
  private httpResponse: { [key: string]: HttpResponse<any> } = {};
  constructor() {}

  public put(key: string, response: HttpResponse<any>): void {
    //console.log('caching response');
    this.httpResponse[key] = response;
  }
  public get(key: string): HttpResponse<any> | undefined | null {
    return this.httpResponse[key];
  }
  public remove(key: string): void {
    delete this.httpResponse[key];
  }
  public clear(): void {
    this.httpResponse = {};
  }
  public logCache(): void {
    console.log(this.httpResponse);
  }
}
