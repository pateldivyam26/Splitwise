export class User{
    _id: string;
    username: string;
    email: string;
    password: string;
    groups: string[];
    constructor(_id:string, username:string, email:string, password:string, groups:string[]=[]){
        this._id = _id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.groups = groups;
    }
}