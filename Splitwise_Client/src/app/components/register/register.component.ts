import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  formData = { username: '', email: '', password: '' };
  errorMessage: string =''
  showEmailAndPassword: boolean = false;
  
  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {}

  onNameInputChange() {
    this.showEmailAndPassword = this.formData.username.trim().length > 0;
  }

  openSnackBar(message: string, action: string) {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';
    this._snackBar.open(message, action, config);
  }

  showMessage() {
    this.openSnackBar('User Registered Successfully!!', 'Close');
  }

  onSubmit() {
    this.authService.register(this.formData).subscribe({
      next : (response: any) => {
        this.showMessage();
        // localStorage.setItem('token', response.token)
        // localStorage.setItem('userEmail', this.formData.email)
        this.errorMessage='';
        this.router.navigate(['/login']).then(() => {
          location.reload();
        });
      },
      error :(error) => {
        this.errorMessage = error.error.message;
      }
    });
  }

  togglePassword() {
    const x = document.getElementById('password');
    if (x && x.getAttribute('type') == 'password') {
      x.setAttribute('type', 'text');
    } else if (x) {
      x.setAttribute('type', 'password');
    }
  }
}
