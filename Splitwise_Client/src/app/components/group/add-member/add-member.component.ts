import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { InvitationService } from 'src/app/services/invitation.service';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit {
  addMemberForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  groupId: string = '';

  constructor(private fb: FormBuilder,
    private invitationService: InvitationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router) {
    this.addMemberForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.groupId = params['groupId'];
      this.errorMessage = '';
      this.successMessage = '';
    });
  }
  
  get controls() { return this.addMemberForm.controls; }

  onAddUser() {
    if (this.addMemberForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';
      const userEmail = this.addMemberForm.value.email;
      const senderEmail = this.authService.getCurrentUser();
      this.invitationService.sendInvitation(senderEmail!, userEmail, this.groupId).subscribe({
        next: (response) => {
          this.successMessage = 'Invitation sent successfully to ' + userEmail;
          this.errorMessage = '';
          this.addMemberForm.reset();
        },
        error: (error) => {
          switch (error.error.type) {
            case 'user_not_found':
              this.errorMessage = error.error.message;
              break;
            case 'user_already_present':
              this.errorMessage = error.error.message;
              break;
            case 'user_already_invited':
              this.errorMessage = error.error.message;
              break;

            case 'group_not_found':
              this.errorMessage = error.error.message;
              break;

            case 'sender_not_found':
              this.errorMessage = error.error.message + " You will be logged out in 10 seconds.";
              setTimeout(() => {
                this.router.navigate(['/home']).then(() => {
                  location.reload();
                });
                this.authService.logout();
              }, 10000);
              break;
            default:
              this.errorMessage = 'An unexpected error occurred.';
          }
          console.error('Error adding user to group:', error);
        }
      });
    }
  }
}
