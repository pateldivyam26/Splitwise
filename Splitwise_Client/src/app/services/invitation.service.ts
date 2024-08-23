import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  private invitationUrl = 'http://localhost:3000/invitations';

  httpHeader={
    headers:new HttpHeaders({
      'Content-Type':'application/json'
    })
  }
  
  constructor(private http: HttpClient) { }

  sendInvitation(senderEmail: string, userEmail: string, groupId: string): Observable<any> {
    return this.http.post(`${this.invitationUrl}/send`, { senderEmail, userEmail, groupId });
  }

  acceptInvitation(invitationId: string, userEmail: string): Observable<any> {
    return this.http.post(`${this.invitationUrl}/accept`, { invitationId, userEmail });
  }

  declineInvitation(invitationId: string, userEmail: string): Observable<any> {
    return this.http.post(`${this.invitationUrl}/decline`, { invitationId, userEmail });
  }

  httpError(error:HttpErrorResponse){
    let msg='';
    if(error.error instanceof ErrorEvent){
      msg=error.error.message;
    }
    else{
      msg=`Error Code:${error.status}\nMessage:${error.message}`;
    }
    console.log(msg);
    return throwError(msg);
  }
}
