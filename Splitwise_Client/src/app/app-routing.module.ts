import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { ContactComponent } from './components/contact/contact.component';
import { FairnessCalculatorComponent } from './components/fairness-calculator/fairness-calculator.component';
import { CreateGroupComponent } from './components/create-group/create-group.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GroupComponent } from './components/group/group.component';
import { ViewExpenseComponent } from './components/group/view-expense/view-expense.component';
import { AddExpenseComponent } from './components/group/add-expense/add-expense.component';
import { AddMemberComponent } from './components/group/add-member/add-member.component';
import { ViewBalanceComponent } from './components/group/view-balance/view-balance.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "login", component: LoginComponent },
  { path: "signup", component: RegisterComponent },
  { path: "contact", component: ContactComponent },
  { path: "calculators", component: FairnessCalculatorComponent },
  { path: "groups/new", component: CreateGroupComponent, canActivate: [AuthGuard] },
  { path: "account/settings", component: EditProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], children: [
      {
        path: 'groups/:groupId', component: GroupComponent, canActivate: [AuthGuard], children: [
          { path: 'view-balance', component: ViewBalanceComponent, canActivate: [AuthGuard] },
          { path: 'view-expense', component: ViewExpenseComponent, canActivate: [AuthGuard] },
          { path: 'add-expense', component: AddExpenseComponent, canActivate: [AuthGuard] },
          { path: 'add-member', component: AddMemberComponent, canActivate: [AuthGuard] },
          { path: "404", component: PageNotFoundComponent },
        ]
      }
    ]
  },
  { path: "404", component: PageNotFoundComponent },
  { path: "home", component: HomeComponent },
  { path: "**", redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
