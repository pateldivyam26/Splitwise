import { MatDatepickerModule, MatDateRangeInput } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ContactComponent } from './components/contact/contact.component';
import { CreateGroupComponent } from './components/create-group/create-group.component';
import { ExpenseFilterPipe } from './pipes/expense-filter.pipe';
import { AbsolutePipe } from './pipes/absolute.pipe';
import { FairnessCalculatorComponent } from './components/fairness-calculator/fairness-calculator.component';
import { FooterComponent } from './components/footer/footer.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { AuthService } from './services/auth.service';
import { GroupComponent } from './components/group/group.component';
import { MatIconModule } from '@angular/material/icon';
import { AddExpenseComponent } from './components/group/add-expense/add-expense.component';
import { ViewExpenseComponent } from './components/group/view-expense/view-expense.component';
import { AddMemberComponent } from './components/group/add-member/add-member.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { ViewBalanceComponent } from './components/group/view-balance/view-balance.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    PageNotFoundComponent,
    DashboardComponent,
    ContactComponent,
    CreateGroupComponent,
    ExpenseFilterPipe,
    AbsolutePipe,
    FairnessCalculatorComponent,
    FooterComponent,
    EditProfileComponent,
    GroupComponent,
    AddExpenseComponent,
    ViewExpenseComponent,
    AddMemberComponent,
    ViewBalanceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule, HttpClientModule, FormsModule, ReactiveFormsModule, MatIconModule, MatTableModule,
    MatSortModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule

  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
