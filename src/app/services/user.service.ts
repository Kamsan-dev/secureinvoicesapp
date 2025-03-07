import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AccountType, Profile } from '../interfaces/appstate';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { LoginRequestInterface, registerRequestInterface, updateProfilePasswordRequestInterface, updateProfilRequestInterface } from '../interfaces/login-request';
import { PersistanceService } from './persistance.service';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from '../interfaces/user';
import { environment } from 'src/environments/environment';

@Injectable()
export class UserService {
  constructor(
    private http: HttpClient,
    private persistanceService: PersistanceService,
    private router: Router,
  ) {}
  private readonly server: string = environment.API_BASE_URL;
  private jwtHelper = new JwtHelperService();
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  public isAuthenticated = (): boolean => {
    const token = this.persistanceService.get<string>('access-token');
    const refreshToken = this.persistanceService.get<string>('refresh-token');

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return true;
    }
    if (refreshToken && !this.jwtHelper.isTokenExpired(refreshToken)) {
      return true;
    }
    return false;
  };

  public login(requestLogin: LoginRequestInterface): Observable<CustomHttpResponse<Profile>> {
    const body = { email: requestLogin.email, password: requestLogin.password };
    return this.http.post<CustomHttpResponse<Profile>>(this.server + 'user/login', body).pipe(
      tap({
        next: (response: CustomHttpResponse<Profile>) => {
          if (response.data?.user.usingMfa === false) {
            this.userSubject.next(response.data.user);
          }
        },
      }),
    );
  }

  public register(request: registerRequestInterface): Observable<CustomHttpResponse<Profile>> {
    return this.http.post<CustomHttpResponse<Profile>>(this.server + 'user/register', request);
  }

  public resetPassword(email: string): Observable<CustomHttpResponse<Profile>> {
    return this.http.get<CustomHttpResponse<Profile>>(`${this.server}user/resetpassword/${email}`);
  }

  public logout(): void {
    this.persistanceService.remove('refresh-token');
    this.persistanceService.remove('access-token');
    this.router.navigate(['login']);
    this.userSubject.next(null);
  }

  public verifyCode(request: any): Observable<CustomHttpResponse<Profile>> {
    return this.http.get<CustomHttpResponse<Profile>>(this.server + 'user/verify/code/' + request.email + '/' + request.code).pipe(
      tap({
        next: (response: CustomHttpResponse<Profile>) => {
          this.userSubject.next(response.data?.user || null);
        },
      }),
    );
  }

  public profile(): Observable<CustomHttpResponse<Profile>> {
    return this.http.get<CustomHttpResponse<Profile>>(this.server + 'user/profile').pipe(
      tap({
        next: (response: CustomHttpResponse<Profile>) => {
          this.userSubject.next(response.data?.user || null);
        },
      }),
    );
  }

  public updateProfile(updateRequest: updateProfilRequestInterface): Observable<CustomHttpResponse<Profile>> {
    return this.http.patch<CustomHttpResponse<Profile>>(this.server + 'user/update', updateRequest).pipe(
      tap({
        next: (response: CustomHttpResponse<Profile>) => {
          this.userSubject.next(response.data?.user || null);
        },
      }),
    );
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
    return this.http.post<CustomHttpResponse<Profile>>(this.server + 'user/update/password/verification', requestPassword);
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
    return this.http.patch<CustomHttpResponse<Profile>>(this.server + 'user/update/image', form).pipe(
      tap({
        next: (response: CustomHttpResponse<Profile>) => {
          this.userSubject.next(response.data?.user || null);
        },
      }),
    );
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

  // reset password process
  public verify(key: string, type: AccountType): Observable<CustomHttpResponse<Profile>> {
    return this.http.get<CustomHttpResponse<Profile>>(`${this.server}user/verify/${type}/${key}`);
  }

  public renewPassword(key: string, form: { newPassword: string; confirmPassword: string }): Observable<CustomHttpResponse<null>> {
    return this.http.patch<CustomHttpResponse<null>>(`${this.server}user/resetpassword/${key}`, form);
  }
}
