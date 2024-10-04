import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CustomHttpResponse } from '../interfaces/custom-http-response';
import { Observable } from 'rxjs';
import { LoginRequestInterface } from '../interfaces/login-request';
import { Profile } from '../interfaces/appstate';
import { User } from '../interfaces/user';

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

  public profile(): Observable<CustomHttpResponse<Profile>> {
    return this.http.get<CustomHttpResponse<Profile>>(this.server + 'user/profile', {
      headers: new HttpHeaders().set(
        'Authorization',
        'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJTZWN1cmVJbnZvaWNlcyIsImF1ZCI6IkNVU1RPTUVSX01BTkFHRU1FTlRfU0VSVklDRVMiLCJpYXQiOjE3MjgwMDU2NzIsInN1YiI6ImRldkBlbWFpbC5jb20iLCJhdXRob3JpdGllcyI6WyJSRUFEOlVTRVIiLCIgUkVBRDpDVVNUT01FUiIsIiBVUERBVEU6VVNFUiIsIiBVUERBVEU6Q1VTVE9NRVIiLCIgQ1JFQVRFOlVTRVIiLCIgQ1JFQVRFOkNVU1RPTUVSIl0sImV4cCI6MTcyODQzNzY3Mn0.9QM9kSQWZrriJg0Xhnm69IzDzZhnvDL9pMMlzg4OJHtyy12soKdbqH54rnqi5J18dn8BInWpzEnHMgWQTXyb8w',
      ),
    });
  }
}
