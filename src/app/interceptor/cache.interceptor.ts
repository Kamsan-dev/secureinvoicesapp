import { inject, Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { HttpCacheService } from '../services/http.cache.service';
import { shouldNotIntercept } from './skip-url-helper';

export class CacheInterceptor implements HttpInterceptor {
  private httpCache = inject(HttpCacheService);

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> | Observable<HttpResponse<unknown>> {
    if (shouldNotIntercept(request.url)) {
      return next.handle(request);
    }

    if (request.method !== 'GET' || request.url.includes('download')) {
      this.httpCache.clear();
    }

    const cachedResponse: HttpResponse<any> | null | undefined = this.httpCache.get(request.url);
    if (cachedResponse) {
      console.log('Found response in cache', cachedResponse);
      this.httpCache.logCache();
      return of(cachedResponse);
    }

    return this.handleRequestCache(request, next);
  }
  private handleRequestCache(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap((response) => {
        if (response instanceof HttpResponse && request.method !== 'DELETE') {
          this.httpCache.put(request.url, response);
        }
      }),
    );
  }
}
