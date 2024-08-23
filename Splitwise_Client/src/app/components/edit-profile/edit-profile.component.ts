import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  editProfileForm: FormGroup;
  userEmail: string = '';
  userId: string = '';
  editingName: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.editProfileForm = this.fb.group({
      username: ['', Validators.required],
      email: [{value:'', disabled: true}],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userEmail = this.authService.getCurrentUser() || '';

    if (this.userEmail) {
      this.userService.getUserDetailsByEmail(this.userEmail).subscribe(
        (data) => {
          this.userId = data.id;
          this.editProfileForm.patchValue({
            username: data.name,
            email: data.email,
            password:data.password
          });
        },
        (error) => {
          console.error('Error fetching user details', error);
        }
      );
    }
  }

  get controls() { return this.editProfileForm.controls; }

  toggleEditing(field: string): void {
    if (field === 'name') {
      this.editingName = !this.editingName;
      if (!this.editingName) {
        this.onSubmit();
      }
    }
  }

  onSubmit(): void {
    if (this.editProfileForm.valid) {
      this.userService.updateUserDetailsByEmail(this.userEmail, this.editProfileForm.value).subscribe(
        (response) => {
          console.log('Profile updated successfully');
        },
        (error) => {
          console.error('Error updating profile', error);
        }
      );
    }
  }
}
