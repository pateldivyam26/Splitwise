import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { ExpenseService } from 'src/app/services/expense.service';
import { GroupService } from 'src/app/services/group.service';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss']
})
export class AddExpenseComponent implements OnInit {
  mode: 'add' | 'edit' = 'add';
  members: any[] = [];
  groupId!: string | null;
  expenseForm: FormGroup;
  expensetoEdit: any;
  participants: any[] = [];
  participantAmounts: { [key: string]: number } = {};
  participantShares: { [key: string]: number } = {};
  participantPercentages: { [key: string]: number } = {};
  selectedSplitType: 'equal' | 'unequal' | 'shares' | 'percentages' = 'equal';

  categories: { title: string, categories: string[] }[] = [
    { title: 'Entertainment', categories: ['Games', 'Movies', 'Music', 'Other', 'Sports'] },
    { title: 'Food and drink', categories: ['Dining out', 'Groceries', 'Liquor', 'Other'] },
    { title: 'Home', categories: ['Electronics', 'Furniture', 'Household supplies', 'Maintenance', 'Mortgage', 'Other', 'Pets', 'Rent', 'Services'] },
    { title: 'Life', categories: ['Childcare', 'Clothing', 'Education', 'Gifts', 'Insurance', 'Medical expenses', 'Other', 'Taxes'] },
    { title: 'Transportation', categories: ['Bicycle', 'Bus/train', 'Car', 'Gas/fuel', 'Hotel', 'Other', 'Parking', 'Plane', 'Taxi'] },
    { title: 'Uncategorized', categories: ['General'] },
    { title: 'Utilities', categories: ['Cleaning', 'Electricity', 'Heat/gas', 'Other', 'Trash', 'TV/Phone/Internet', 'Water'] },
  ];

  constructor( private fb: FormBuilder, private expenseService: ExpenseService, private groupService: GroupService, private route: ActivatedRoute, private router: Router) {
    this.expenseForm = this.fb.group({
      expenseName: ['', Validators.required],
      payer: ['', Validators.required],
      participants: [[]],
      expenseDate: [new Date().toISOString().split('T')[0]],
      description: [''],
      amount: ['', [Validators.required, Validators.min(0), this.validateDecimal]],
      category: ['Other'],
    });
  }
  
  ngOnInit(): void {
    this.route.queryParams.pipe(
      switchMap(params => {
        this.groupId = params['groupId'];
        return this.fetchMembers().pipe(
          catchError(error => {
            console.error('Error fetching members:', error);
            return of([]);
          }),
          finalize(() => {
            this.participants.forEach((participant) => {
              this.participantAmounts[participant.id] = 0
              this.participantShares[participant.id] = 0
              this.participantPercentages[participant.id] = 0
            });
            if (this.route.snapshot.queryParams['mode'] === 'edit' && this.route.snapshot.queryParams['expense']) {
              this.expensetoEdit = JSON.parse(this.route.snapshot.queryParams['expense']);
              this.mode = 'edit';
              this.populateFormWithExpenseData(this.expensetoEdit);
            }
          })
        );
      })
    )
      .subscribe();
  }

  get controls() { return this.expenseForm.controls; }

  populateFormWithExpenseData(expense: any): void {
    const expenseDate = new Date(expense.expenseDate).toISOString().split('T')[0];
    let participants: any = [];
    Object.keys(expense.participants).forEach(participantId => {
      let memberDetails = this.members.find(member => member.id === participantId);
      participants.push(memberDetails);
      this.participantAmounts[participantId] = expense.participants[participantId];
      this.participantShares[participantId] = 0;
      this.participantPercentages[participantId] = parseFloat(((expense.participants[participantId] * 100) / expense.amount).toFixed(2));
    });
    this.expenseForm.setValue({
      expenseName: expense.expenseName,
      payer: expense.payer,
      expenseDate: expenseDate,
      description: expense.description,
      amount: expense.amount,
      participants: participants,
      category: expense.category,
    });
    this.participants = participants
    this.selectedSplitType = expense.splitType
  }

  fetchMembers() {
    if (this.groupId) {
      return this.groupService.getMembers(this.groupId).pipe(
        tap(members => {
          this.members = members;
          this.participants = members;
        })
      );
    } else {
      return of([]);
    }
  }

  canAddExpense(): boolean {
    const payerId = this.expenseForm.get('payer')?.value;
    return this.participants.length >= 1 && this.participants.some(participant => participant.id !== payerId);
  }

  onAddOrUpdateExpense() {
    if (this.expenseForm.valid && this.canAddExpense()) {
      const expenseData = {
        ...this.expenseForm.value,
        groupId: this.groupId
      }
      const payerId = expenseData.payer;
      const payer = this.members.find(member => member.id === payerId);
      let payerName = ''
      if (payer) {
        payerName = payer.name;
      }
      expenseData.payerName = payerName
      expenseData.amount = parseFloat(expenseData.amount.toFixed(2));

      let participants: any = {}

      if (this.selectedSplitType === 'unequal') {
        this.participants.forEach((participant) => {
          participants[participant.id] = this.participantAmounts[participant.id]
        });
        expenseData.splitType = 'unequal'
      }
      else if (this.selectedSplitType === 'shares') {
        const totalShares = Object.values(this.participantShares)
          .reduce((sum, share) => sum + share, 0);
        this.participants.forEach((participant) => {
          const splitAmount = parseFloat(((expenseData.amount * this.participantShares[participant.id]) / totalShares).toFixed(2));
          participants[participant.id] = splitAmount
        });
        expenseData.splitType = 'shares'
      }
      else if (this.selectedSplitType === 'percentages') {
        this.participants.forEach((participant) => {
          const splitAmount = parseFloat(((expenseData.amount * this.participantPercentages[participant.id]) / 100).toFixed(2));
          participants[participant.id] = splitAmount
        });
        expenseData.splitType = 'percentages'
      }
      else {
        const splitAmount = parseFloat((expenseData.amount / this.participants.length).toFixed(2));
        this.participants.forEach((participant) => {
          participants[participant.id] = splitAmount
        });
        expenseData.splitType = 'equal'
      }

      expenseData.participants = participants
      if (!expenseData.expenseDate) {
        expenseData.expenseDate = new Date().toISOString().split('T')[0]
      }
      if (this.mode === 'add') {
        this.onAddExpense(expenseData)
      }
      else {
        this.onUpdateExpense(expenseData)
      }
    }
  }
  onAddExpense(expenseData: any) {
    this.expenseService.addExpense(expenseData).subscribe(
      (response) => {
        this.expenseForm.reset();
        this.router.navigate(['dashboard/groups', this.groupId, 'view-balance'], { queryParams: { groupId: this.groupId } });

      },
      (error) => {
        console.error('Error adding expense:', error);
      }
    );

  }

  onUpdateExpense(expenseData: any) {
    this.expenseService.editExpense(this.expensetoEdit._id, expenseData, this.expensetoEdit).subscribe(
      (response) => {
        this.expenseForm.reset();
        this.router.navigate(['dashboard/groups', this.groupId, 'view-balance'], { queryParams: { groupId: this.groupId } });
      },
      (error) => {
        console.error('Error editing expense:', error);
      }
    );
  }

  toggleParticipant(participantId: string): void {
    if (this.participants.find(participant => participant.id === participantId)) {
      this.participants = this.participants.filter(participant => participant.id !== participantId);
      delete this.participantAmounts[participantId];
      delete this.participantShares[participantId];
      delete this.participantPercentages[participantId];
    }
    else {
      const memberDetails = this.members.find(member => member.id === participantId)
      this.participants.push(memberDetails)
      this.participantAmounts[participantId] = 0;
      this.participantShares[participantId] = 0;
      this.participantPercentages[participantId] = 0;
    }
  }

  isParticipantSelected(participantId: string): boolean {
    return this.participants.find(participant => participant.id === participantId);
  }

  updateParticipantAmount(memberId: string, event: any): void {
    if (this.selectedSplitType === 'percentages') {
      this.participantPercentages[memberId] = event.target.valueAsNumber;
    }
    else {
      this.participantAmounts[memberId] = event.target.valueAsNumber;
    }
  }
  updateParticipantAmountDecimal(memberId: string, event: any): void {
    if (this.selectedSplitType === 'percentages') {
      this.participantPercentages[memberId] = parseFloat(event.target.valueAsNumber.toFixed(2));
    }
    else {
      this.participantAmounts[memberId] = parseFloat(event.target.valueAsNumber.toFixed(2));
    }

  }
  updateParticipantShares(memberId: string, event: any): void {
    this.participantShares[memberId] = event.target.valueAsNumber;
  }

  toggleSplitType(splitType: 'equal' | 'unequal' | 'shares' | 'percentages') {
    this.selectedSplitType = splitType;
  }

  isTotalAmountValid(): boolean {
    if (this.selectedSplitType === 'unequal') {
      const isAmountValid = Object.keys(this.participantAmounts).every(participantId => {
        const amount = this.participantAmounts[participantId];
        return amount > 0;
      });

      const totalParticipantAmount = Object.values(this.participantAmounts)
        .reduce((sum, amount) => sum + amount, 0);

      return isAmountValid && totalParticipantAmount.toFixed(2) === this.expenseForm.value.amount.toFixed(2);
    }

    else if (this.selectedSplitType === 'shares') {
      const isShareValid = Object.keys(this.participantShares).every(participantId => {
        const share = this.participantShares[participantId];
        return Number.isInteger(share) && share > 0;
      });

      return isShareValid;
    }

    else if (this.selectedSplitType === 'percentages') {
      const isPercentageValid = Object.keys(this.participantPercentages).every(participantId => {
        const percentage = this.participantPercentages[participantId];
        return percentage > 0;
      });

      const totalParticipantPercentage = Object.values(this.participantPercentages)
        .reduce((sum, percentage) => sum + percentage, 0);
      return isPercentageValid && totalParticipantPercentage == 100;
    }

    return true;
  }

  validateDecimal(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (value !== null && value !== undefined) {
      const decimalRegex = /^\d+(\.\d{1,2})?$/;
      if (!decimalRegex.test(value)) {
        return { 'invalidDecimal': true };
      }
    }
    return null;
  }
}
