import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { Observable } from 'rxjs';
import { LoginRequestInterface } from '../interfaces/login-request';
import { Profile } from '../interfaces/appstate';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  private readonly server: string = 'http://localhost:8080/';

  public login(requestLogin: LoginRequestInterface): Observable<CustomHttpResponse<Profile>> {
    const body = { email: requestLogin.email, password: requestLogin.password };
    return this.http.post<CustomHttpResponse<Profile>>(this.server + 'user/login', body);
  }

  public verifyCode(request: any): Observable<CustomHttpResponse<Profile>> {
    return this.http.get<CustomHttpResponse<Profile>>(this.server + 'user/verify/code/' + request.email + '/' + request.code);
  }
}
