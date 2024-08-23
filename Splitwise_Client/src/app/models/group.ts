export class Group{
    _id: string;
    name: string;
    balance: any;
    balancesWithNames: any;
    members: string[];
    constructor(_id:string, name: string, balance: any, balancesWithNames: any, members: string[]){
        this._id = _id;
        this.name = name;
        this.balance = balance;
        this.balancesWithNames = balancesWithNames;
        this.members = members;
    }
}