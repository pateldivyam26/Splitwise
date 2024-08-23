import { Category } from './../../../../../../../MELENTO/MELENTO_Client/src/app/models/category';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpenseService } from 'src/app/services/expense.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { GroupService } from 'src/app/services/group.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-view-expense',
  templateUrl: './view-expense.component.html',
  styleUrls: ['./view-expense.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ViewExpenseComponent implements OnInit {
  members: any[] = [];
  groupId!: string;
  expenses: any[] = [];
  searchTerm: string = '';
  startDate!: Date | null;
  endDate!: Date | null;
  participants: any[] = [];
  participantsArray: any[] = [];
  expenseNo: number = 0;
  currentUser: any;
  chartOptions: any;

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['expenseDate', 'expenseImage', 'expenseName', 'payerName', 'amount', 'actions'];
  expandedElement: any | null;
  expenseList = new MatTableDataSource<any>([]);

  constructor(private expenseService: ExpenseService, private groupService: GroupService, private authService: AuthService, private userService: UserService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.currentUser = this.userService.getUserDetailsByEmail(this.authService.getCurrentUser() || '').subscribe((response) => {
        this.currentUser = response
      })
      this.fetchExpenses();
      // this.initializeChartOptions();
    });
  }

  fetchExpenses() {
    this.expenseService.getExpensesOfGroup(this.groupId).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.expenseNo = this.expenses.length;
        this.expenseList = new MatTableDataSource(expenses);
        this.expenseList.sort = this.sort;
        this.expenseList.filterPredicate = this.expenseFilter();
        this.applyFilterExpense();
        this.fetchParticipantsDetails();
        // this.updateChartOptions();
      },
      error: (error) => {
        console.error('Error fetching expenses', error);
      },
    });
  }

  // initializeChartOptions(): void {
  //   this.chartOptions = {
  //     animationEnabled: true,
  //     title: {
  //       text: "Expenses by Category"
  //     },
  //     data: [{
  //       type: "pie",
  //       startAngle: -90,
  //       indexLabel: "{name}: {y}",
  //       yValueFormatString: "#,###'%'",
  //       dataPoints: []
  //     }]
  //   };
  // }

  // updateChartOptions(): void {
  //   if (this.expenses && this.expenses.length > 0) {
  //     const categoryWiseData = this.expenses.reduce((acc: any, expense: any) => {
  //       const category = expense.category;
  //       if (!acc[category]) {
  //         acc[category] = 0;
  //       }
  //       acc[category] += expense.amount;
  //       return acc;
  //     }, {});

  //     const dataPoints = Object.keys(categoryWiseData).map((category) => ({
  //       y: categoryWiseData[category],
  //       name: category
  //     }));

  //     this.chartOptions.data[0].dataPoints = dataPoints;
  //   }
  // }

  // public captureScreen() {
  //   var data = document.getElementById("chartsContainer");
  //   if (data) {
  //     html2canvas(data).then(canvas => {
  //       var imgWidth = 190;
  //       var pageHeight = 297;
  //       var imgHeight = (canvas.height * imgWidth) / canvas.width;
  //       var heightLeft = imgHeight;

  //       const contentDataURL = canvas.toDataURL("image/png");
  //       let pdf = new jspdf("p", "mm", "a4");
  //       var position = (pageHeight - imgHeight) / 2;

  //       pdf.addImage(contentDataURL, "PNG", 10, position, imgWidth, imgHeight);
  //       pdf.save(`Group_Expenses_${this.groupId}.pdf`);
  //     }).catch(error => {
  //       console.error('Error generating PDF: ', error);
  //     });
  //   } else {
  //     console.error('Element not found!');
  //   }
  // }

  fetchParticipantsDetails() {
    this.expenses.forEach(expense => {
      this.groupService.getMembers(expense.groupId).subscribe({
        next: (response) => {
          expense.members = response;
          expense.participantsArray = [];
          this.updateParticipantsDetails(expense);
        },
        error: (error) => {
          console.log(error);
        },
      });
    });
  }

  updateParticipantsDetails(expense: any): void {
    Object.entries(expense.participants).forEach(([participantId, contributionAmount]: [string, any]): void => {
      const participant = expense.members.find((member: any) => member.id === participantId);
      const participantName = participant ? participant.name : 'Unknown';

      let participantDetail = {
        name: participantName,
        amount: contributionAmount || 0,
        isPayer: expense.payer === participantId,
      };

      expense.participantsArray.push(participantDetail);
    });
  }

  applyFilterExpense(): void {
    const filterValue = this.searchTerm.toLowerCase();
    const filterObj: any = { searchTerm: filterValue, startDate: this.startDate, endDate: this.endDate };
    this.expenseList.filter = JSON.stringify(filterObj);
  }

  expenseFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string): boolean => {
      const filterObj = JSON.parse(filter);
      const searchText = filterObj.searchTerm;
      const isExpenseNameMatch = data.expenseName.toLowerCase().includes(searchText);
      const isPayerNameMatch = data.payerName.toLowerCase().includes(searchText);
      const isAmountMatch = data.amount.toString().includes(searchText);
      const isDateInRange = filterObj.startDate && filterObj.endDate ? this.isDateInRange(new Date(data.expenseDate), new Date(filterObj.startDate), new Date(filterObj.endDate)) : true;

      return (isExpenseNameMatch || isPayerNameMatch || isAmountMatch) && isDateInRange;
    };
  }

  isDateInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return (!startDate || date >= startDate) && (!endDate || date <= endDate);
  }

  clearDateRange() {
    this.startDate = null;
    this.endDate = null;
    this.applyFilterExpense();
  }

  deleteExpense(expense: any): void {
    const confirmDelete = confirm('Are you sure you want to delete this expense? This will completely remove this expense for ALL people involved, not just you.');
    if (confirmDelete) {
      this.expenseService.deleteExpense(expense._id).subscribe({
        next: (res) => {
          this.fetchExpenses();
        },
        error: (error) => {
          console.error('Error deleting expense', error);
        },
      });
    }
  }

  editExpense(expense: any) {
    const expenseString = JSON.stringify(expense);
    this.router.navigate(['dashboard/groups', this.groupId, 'add-expense'], {
      queryParams: {
        mode: 'edit',
        expense: expenseString,
        groupId: this.groupId
      },
    });
  }

  calculateLentAmount(element: any): number {
    if (!element.participantsArray || !this.currentUser || !element.participantsArray.length) {
      return 0;
    }
    const userShare = element.participantsArray.find((p: any) => p.name === this.currentUser.name)?.amount || 0;
    return element.amount - userShare;
  }

  calculateOwedAmount(element: any): number {
    if (!element.participantsArray || !this.currentUser || !element.participantsArray.length) {
      return 0;
    }
    return element.participantsArray.find((p: any) => p.name === this.currentUser.name)?.amount || 0;
  }

  downloadExpenses(): void {
    const worksheetData = this.prepareExcelData();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook: XLSX.WorkBook = { Sheets: { 'Expenses': worksheet }, SheetNames: ['Expenses'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'Expenses');
  }

  prepareExcelData(): any[] {
    return this.expenses.map(expense => {
      const expenseRow: any = {
        'Date': new Date(expense.expenseDate).toLocaleDateString(),
        'Expense Name': expense.expenseName,
        'Category': expense.category,
        'Amount Paid': 'INR' + expense.amount,
      };
      expense.participantsArray.forEach((participant: { name: string; amount: any; }) => {
        expenseRow[participant.name] = participant.amount;
      });
      return expenseRow;
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(data);
    downloadLink.href = url;
    downloadLink.download = `${fileName}.xlsx`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8;';
