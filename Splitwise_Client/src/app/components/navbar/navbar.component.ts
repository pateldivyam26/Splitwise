import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  user: string | void = '';
  userDetails: any;
  userLoggedIn: boolean = false;
  userInitials: string = '';

  constructor(public authService: AuthService, public userService: UserService, private router: Router) {
    this.user = this.authService.getCurrentUser()
    if (!this.user) {
      this.authService.logout()
    }
    if(this.user){
      this.userService.getUserDetailsByEmail(this.user).subscribe({
        next: (res) => {
          this.userDetails = res;
          this.userLoggedIn = true;
          this.userInitials = this.userDetails?.name ? this.userDetails.name.charAt(0).toUpperCase() : '';
        },
        error: (error) => {
          console.error('Error fetching user details:', error);
        }
      });
    }
  }

  onLogoClick() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }
  onLogout() {
    this.userLoggedIn = false;
    this.router.navigate(['/home']).then(() => {
      location.reload();
    });
    this.authService.logout();
  }
}
