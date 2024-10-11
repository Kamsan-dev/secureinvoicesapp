import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, throwError } from 'rxjs';
import { shouldNotIntercept } from './skip-url-helper';
import { PersistanceService } from '../services/persistance.service';
import { UserService } from '../services/user.service';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { Profile } from '../interfaces/appstate';

@Injectable({ providedIn: 'root' })
export class TokenInterceptor implements HttpInterceptor {
  private isTokenRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<CustomHttpResponse<Profile> | null> = new BehaviorSubject<CustomHttpResponse<Profile> | null>(null);
  constructor(
    private persistanceService: PersistanceService,
    private userService: UserService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> | Observable<HttpResponse<unknown>> {
    if (shouldNotIntercept(request.url)) {
      return next.handle(request);
    }

    return next.handle(this.addAuthorizationTokenHeader(request, this.persistanceService.get('access-token'))).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error instanceof HttpErrorResponse && error.status === 401 && error.error.reason.includes('expired')) {
          return this.handleRefreshToken(request, next);
        } else {
          return throwError(() => error);
        }
      }),
    );
  }
  private handleRefreshToken(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isTokenRefreshing) {
      console.log('Refreshing token');
      this.isTokenRefreshing = true;
      this.refreshTokenSubject.next(null);
      return this.userService.refreshToken().pipe(
        switchMap((response: CustomHttpResponse<Profile>) => {
          this.isTokenRefreshing = false;
          this.refreshTokenSubject.next(response);
          return next.handle(this.addAuthorizationTokenHeader(request, response.data?.access_token));
        }),
      );
    } else {
      console.log('using new access-token');
      return this.refreshTokenSubject.pipe(
        filter((response: CustomHttpResponse<Profile> | null): response is CustomHttpResponse<Profile> => response !== null), // Type guard to filter out null values
        switchMap((response: CustomHttpResponse<Profile>) => {
          return next.handle(this.addAuthorizationTokenHeader(request, response.data?.access_token));
        }),
      );
    }
  }

  private addAuthorizationTokenHeader(request: HttpRequest<unknown>, accesToken: unknown): HttpRequest<any> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${accesToken}` } });
  }
}
