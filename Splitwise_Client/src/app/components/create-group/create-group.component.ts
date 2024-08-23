import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit {
  groupForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private groupService: GroupService, private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  openSnackBar(message: string, action: string) {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';
    this._snackBar.open(message, action, config);
  }

  showMessage() {
    this.openSnackBar('Group Created Successfully!!', 'Close');
  }

  ngOnInit(): void { }

  onSubmit() {
    if (this.groupForm.valid) {
      const groupData = {
        ...this.groupForm.value
      };
      this.groupService.createGroup(groupData).subscribe(
        (group) => {
          this.showMessage();
          this.groupService.addUserToGroup(group._id, this.authService.getCurrentUser()!).subscribe(
            (response) => {
              this.router.navigate(['/dashboard'])
            },
            (error) => {
              console.error('Error adding user to group:', error.error.message);
            }
          );
          this.groupForm.reset();
          this.errorMessage = '';
        },
        (error) => {
          this.errorMessage = error.error.message;
          console.error('Error creating group:', error);
        }
      );
    }
  }
}