import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  formData = { email: '', password: '' };
  errorMessage: string = '';
  errorType: string = '';
  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) { }

  openSnackBar(message: string, action: string) {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.horizontalPosition = 'center';
    config.verticalPosition = 'top';
    this._snackBar.open(message, action, config);
  }

  showMessage() {
    this.openSnackBar('Login Successful!!', 'Close');
  }

  onSubmit() {
    this.authService.login(this.formData).subscribe({
      next: (response: any) => {
        this.showMessage();
        localStorage.setItem('token', response.token)
        localStorage.setItem('userEmail', this.formData.email)
        this.errorMessage = '';
        this.router.navigate(['/dashboard']).then(() => {
          location.reload();
        });
      },
      error: (error) => {
        if (error.error.type && error.error.type == 'incorrect_password') {
          this.errorType = error.error.type;
        }
        this.errorMessage = error.error.message ;
      }
    });
  }

  togglepassword() {
    const x = document.getElementById('password');
    if (x && x.getAttribute('type') == 'password') {
      x.setAttribute('type', 'text');
    } else if (x) {
      x.setAttribute('type', 'password');
    }
  }
}