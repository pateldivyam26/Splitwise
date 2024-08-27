import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { forkJoin, map, Observable, switchMap, throwError } from 'rxjs';
import { Group } from '../models/group';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private groupUrl = 'https://splitwise-crkr.onrender.com/groups';

  httpHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(private http: HttpClient, private authService: AuthService, private usersService: UserService) { }

  createGroup(groupData: any): Observable<Group> {
    groupData = {
      ...groupData,
      creatorEmailId: this.authService.getCurrentUser()
    }
    return this.http.post<Group>(`${this.groupUrl}`, groupData);
  }

  addUserToGroup(groupId: string, userEmail: string): Observable<any> {
    return this.http.post(`${this.groupUrl}/${groupId}/addUserByEmail`, { userEmail })
  }

  getGroupDetailsWithMembers(groupId: string): Observable<any> {
    return this.getGroupDetails(groupId).pipe(
      switchMap((groupDetails: any) =>
        this.fetchAndProcessMembers(groupDetails.members).pipe(
          map((members) => ({
            ...groupDetails,
            members: members,
            balancesWithNames: this.mapBalancesWithNames(groupDetails.balance, members),
          }))
        )
      )
    );
  }

  getGroupDetails(groupId: string): Observable<Group> {
    return this.http.get<Group>(`${this.groupUrl}/${groupId}`)
  }

  private fetchAndProcessMembers(memberDetails: any[]): Observable<any[]> {
    const memberDetailObservables = memberDetails.map((member) =>
      this.usersService.getUserDetails(member.memberId)
    );

    return forkJoin(memberDetailObservables).pipe(
      map((memberResponses) =>
        memberResponses.map((response, index) => ({
          name: response.name,
          id: response.id,
          email: response.email,
          balance: memberDetails[index].memberBalance,
        }))
      )
    );
  }

  private mapBalancesWithNames(balanceItems: any[], members: any[]): any[] {
    const memberDetailsMap = new Map(members.map((member) => [member.id, member.name]));

    return balanceItems.map((balanceItem: any) => ({
      from: memberDetailsMap.get(balanceItem.from) || balanceItem.from,
      to: memberDetailsMap.get(balanceItem.to) || balanceItem.to,
      balance: balanceItem.balance,
    }));
  }

  getMembers(groupId: string): Observable<any[]> {
    return this.getGroupDetails(groupId).pipe(
      switchMap((groupDetails: any) => this.fetchAndProcessMembers(groupDetails.members))
    );
  }

  settleBalance(groupId: string, transactionId: string): Observable<any> {
    return this.http.post<any>(`${this.groupUrl}/${groupId}/transaction/${transactionId}`, {})
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
