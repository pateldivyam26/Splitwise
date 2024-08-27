import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GroupService } from './group.service';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private expensesUrl = 'https://splitwise-crkr.onrender.com/expenses';
  private groupUrl = 'https://splitwise-crkr.onrender.com/groups';

  httpHeader={
    headers:new HttpHeaders({
      'Content-Type':'application/json'
    })
  }
  
  constructor(private http: HttpClient, private groupService: GroupService) { }

  addExpense(expenseData: any): Observable<any> {
    return this.http.post(`${this.expensesUrl}`, expenseData);
  } 

  getExpensesOfGroup(groupId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.groupUrl}/${groupId}/expenses`);
  }


  deleteExpense(expenseId: string): Observable<any> {
    const url = `${this.expensesUrl}/${expenseId}`;
    return this.http.delete(url);
  }

  editExpense(expenseId: string, expenseData: any, oldExpenseData: any): Observable<any> {
    const editUrl = `${this.expensesUrl}/${expenseId}`;
    const combinedData = {expenseData:expenseData, oldExpenseData:oldExpenseData}
    return this.http.put(editUrl, combinedData);
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
