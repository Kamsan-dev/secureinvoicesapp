import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Profile } from '../interfaces/appstate';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { LoginRequestInterface, updateProfilePasswordRequestInterface, updateProfilRequestInterface } from '../interfaces/login-request';
import { PersistanceService } from './persistance.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

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
  private jwtHelper = new JwtHelperService();

  public isAuthenticated = (): boolean => {
    const token = this.persistanceService.get<string>('access-token');
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  };

  public login(requestLogin: LoginRequestInterface): Observable<CustomHttpResponse<Profile>> {
    const body = { email: requestLogin.email, password: requestLogin.password };
    return this.http.post<CustomHttpResponse<Profile>>(this.server + 'user/login', body);
  }

  public logout(): void {
    this.persistanceService.remove('refresh-token');
    this.persistanceService.remove('access-token');
    this.router.navigate(['login']);
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

  public verifyPassword(requestPassword: any): Observable<CustomHttpResponse<Profile>> {
    const body = { password: requestPassword.password };
    console.log(body);
    return this.http.post<CustomHttpResponse<Profile>>(this.server + 'user/update/password/verification', body);
  }

  public updateUserPassword(requestPassword: updateProfilePasswordRequestInterface): Observable<CustomHttpResponse<Profile>> {
    return this.http.patch<CustomHttpResponse<Profile>>(this.server + 'user/update/password', requestPassword);
  }

  public updateUserSettings(form: { enabled: boolean; notLocked: boolean }): Observable<CustomHttpResponse<Profile>> {
    return this.http.patch<CustomHttpResponse<Profile>>(this.server + 'user/update/account-settings', form);
  }

  public updateUserAuthenticationSettings(form: { usingMfa: boolean }): Observable<CustomHttpResponse<Profile>> {
    return this.http.patch<CustomHttpResponse<Profile>>(this.server + 'user/update/authentication-settings', form);
  }

  public updateUserImage(form: FormData): Observable<CustomHttpResponse<Profile>> {
    return this.http.patch<CustomHttpResponse<Profile>>(this.server + 'user/update/image', form);
  }

  public updateUserRole(form: { roleName: string }): Observable<CustomHttpResponse<Profile>> {
    return this.http.patch<CustomHttpResponse<Profile>>(this.server + 'user/update/role', form).pipe(
      tap({
        next: (response: CustomHttpResponse<Profile>) => {
          this.persistanceService.remove('refresh-token');
          this.persistanceService.remove('access-token');
          this.router.navigate(['login']);
        },
      }),
    );
  }
}
