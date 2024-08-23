export class Expense{
    expenseName: string;
    payer: string;
    expenseDate: Date;
    description: string;
    amount: number;
    constructor(expenseName: string, payer: string, expenseDate: Date, description: string, amount: number){
        this.expenseName = expenseName;
        this.payer = payer;
        this.expenseDate = expenseDate;
        this.description = description;
        this.amount = amount;
    }
}