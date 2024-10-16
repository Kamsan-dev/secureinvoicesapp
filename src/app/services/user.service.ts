import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Profile } from '../interfaces/appstate';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { LoginRequestInterface, updateProfilRequestInterface } from '../interfaces/login-request';
import { PersistanceService } from './persistance.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private http: HttpClient,
    private persistanceService: PersistanceService,
    private router: Router,
  ) {}
  private readonly server: string = 'http://localhost:8080/';

  public login(requestLogin: LoginRequestInterface): Observable<CustomHttpResponse<Profile>> {
    const body = { email: requestLogin.email, password: requestLogin.password };
    return this.http.post<CustomHttpResponse<Profile>>(this.server + 'user/login', body);
  }

  public verifyCode(request: any): Observable<CustomHttpResponse<Profile>> {
    return this.http.get<CustomHttpResponse<Profile>>(this.server + 'user/verify/code/' + request.email + '/' + request.code);
  }

  public profile(): Observable<CustomHttpResponse<Profile>> {
    return this.http.get<CustomHttpResponse<Profile>>(this.server + 'user/profile');
  }

  public updateProfile(updateRequest: updateProfilRequestInterface): Observable<CustomHttpResponse<Profile>> {
    return this.http.patch<CustomHttpResponse<Profile>>(this.server + 'user/update', updateRequest);
  }

  public refreshToken(): Observable<CustomHttpResponse<Profile>> {
    return this.http
      .get<CustomHttpResponse<Profile>>(this.server + 'user/refresh/token', {
        headers: { Authorization: 'Bearer ' + this.persistanceService.get('refresh-token') },
      })
      .pipe(
        tap({
          next: (response: CustomHttpResponse<Profile>) => {
            this.persistanceService.remove('refresh-token');
            this.persistanceService.remove('access-token');
            this.persistanceService.set('access-token', response.data?.access_token);
            this.persistanceService.set('refresh-token', response.data?.refresh_token);
          },
          error: (response: HttpErrorResponse) => {
            this.persistanceService.remove('refresh-token');
            this.persistanceService.remove('access-token');
            this.router.navigate(['login']);
          },
        }),
      );
  }
}
