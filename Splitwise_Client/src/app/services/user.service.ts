import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'http://localhost:3000/users';

  httpHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(private http: HttpClient) { }

  getUserGroups(userEmail: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userEmail}/groups`);
  }

  getUserDetails(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}`);
  }

  getUserDetailsByEmail(userEmail: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/email/${userEmail}`);
  }

  updateUserDetailsByEmail(userEmail: string, data: { username?: string, password?: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/email/${userEmail}`, data, this.httpHeader);
  }

  getUserInvitations(userEmail: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/invitations/${userEmail}`);
  }

  httpError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      msg = error.error.message;
    }
    else {
      msg = `Error Code:${error.status}\nMessage:${error.message}`;
    }
    console.log(msg);
    return throwError(msg);
  }
}
