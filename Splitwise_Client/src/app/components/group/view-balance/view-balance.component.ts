import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Group } from 'src/app/models/group';
import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-view-balance',
  templateUrl: './view-balance.component.html',
  styleUrls: ['./view-balance.component.scss']
})
export class ViewBalanceComponent implements OnInit {
  groupId: string = '';
  members!: any;
  groupDetails!: Group;
  currentUser: any;
  balanceWithNames!: any;
  settle: boolean = false;
  selectedBalance: any;
  constructor( private groupService: GroupService, private usersService: UserService, private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.currentUser = this.usersService.getUserDetailsByEmail(this.authService.getCurrentUser() || '').subscribe((response) => {
        this.currentUser = response
      })
      this.fetchGroupDetails()
    });
  }
  
  private fetchGroupDetails() {
    this.groupService.getGroupDetailsWithMembers(this.groupId).subscribe({
      next: (groupDetails) => {
        this.groupDetails = groupDetails;
        this.members = this.groupDetails.members;
        this.balanceWithNames = this.groupDetails.balancesWithNames;
        this.members.map((member: any) => {
          if (member.email == this.currentUser.email) {
            this.currentUser.balance = member.balance;
          }
        })
      },
      error: (error) => {
        console.error('Error fetching group details', error);
      },
    });
  }


  confirmSettleBalance(index: number): void {
    const confirmed = window.confirm('Sure you want to settle this balance?');
    if (confirmed) {
      this.settleSelectedBalance(index);
    }
  }

  settleSelectedBalance(index: any) {
    const transactionId = this.groupDetails.balance[index]._id;
    this.groupService.settleBalance(this.groupId, transactionId).subscribe({
      next: (response) => {
        console.log(response.message)
        this.fetchGroupDetails()
      },
      error: (error) => {
        console.error('Error settling balance:', error);
      }
    });
  }
}