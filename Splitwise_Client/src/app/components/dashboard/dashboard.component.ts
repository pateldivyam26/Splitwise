import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterState } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';
import { InvitationService } from 'src/app/services/invitation.service';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  groups: any[] = [];
  invitations: any[] = [];
  currentUser: string = '';
  hasGroupSelected: boolean = false;
  showingInvitations: boolean = false;
  selectedGroupMembers: any[] = [];
  selectedGroupId: string | null = null;
  totalOwed: number = 0;
  totalLent: number = 0;

  constructor(
    private usersService: UserService, private authService: AuthService, private invitationsService: InvitationService, private groupService: GroupService, private router: Router, private _snackBar: MatSnackBar) {
    this.loadUserGroups();
    this.handleRouteEvents();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser()!
    this.usersService.getUserInvitations(this.currentUser).subscribe({
      next: (invitations) => {
        this.invitations = invitations;
      },
      error: (error) => {
        console.error('Error fetching invitations:', error);
      }
    });
  }

  openSnackBar(message: string, action: string) {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';
    this._snackBar.open(message, action, config);
  }

  showMessage(message:string) {
    this.openSnackBar(message, 'Close');
  }

  showInvitations() {
    this.showingInvitations = true;
  }

  loadUserGroups() {
    this.usersService.getUserGroups(this.authService.getCurrentUser()!).subscribe({
      next: (groups) => {
        this.groups = groups;
      },
      error: (error) => {
        console.error('Error loading user groups:', error.error.message);
      }
    });
  }

  handleRouteEvents() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.hasGroupSelected = this.router.url.includes('dashboard/groups/');
        if (this.hasGroupSelected) {
          this.showingInvitations = false;
          const urlParts = this.router.url.split('/');
          this.selectedGroupId = urlParts[3];
          this.loadGroupMembers(this.selectedGroupId);
        }
        else {
          this.selectedGroupId = null;
          this.selectedGroupMembers = [];
        }
      }
    });
  }

  loadGroupMembers(groupId: string) {
    this.groupService.getMembers(groupId).subscribe({
      next: (members) => {
        this.selectedGroupMembers = members;
      },
      error: (error) => {
        console.error('Error loading group members:', error);
      }
    });
  }

  acceptInvitation(invitationId: string) {
    this.showMessage('Invitation Accepted!!');
    this.invitationsService.acceptInvitation(invitationId, this.currentUser).subscribe({
      next: (response) => {
        this.router.navigate(['dashboard/groups', response.groupId, 'view-expense'], { queryParams: { groupId: response.groupId } }).then(() => {
          location.reload();
        });
      },
      error: (error) => {
        console.error('Error ', error.error.message);
      }
    });
  }

  declineInvitation(invitationId: string) {
    this.showMessage('Invitation Declined!!');
    this.invitationsService.declineInvitation(invitationId, this.currentUser).subscribe({
      next: (message) => {
        this.invitations = this.invitations.filter(invitation => invitation._id !== invitationId);
        this.usersService.getUserInvitations(this.currentUser).subscribe({
          next: (invitations) => {
            this.invitations = invitations;
          },
          error: (error) => {
            console.error('Error fetching invitations:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error ', error.error.message);
      }
    });
  }
}